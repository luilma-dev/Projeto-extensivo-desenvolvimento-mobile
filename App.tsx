import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { Order, Status, Tab, Vehicle } from './src/data';
import { database } from './src/storage/database';
import { preferences } from './src/storage/preferences';
import { syncPending } from './src/api/sync';
import { HomeScreen, SyncState } from './src/screens/HomeScreen';
import { FleetScreen } from './src/screens/FleetScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { styles as s } from './src/styles';

const NEXT_STATUS: Record<Status, Status> = { 'Aberta': 'Em andamento', 'Em andamento': 'Concluída', 'Concluída': 'Concluída' };

export default function App() {
  // O estado fica aqui para as três telas compartilharem os mesmos dados.
  // A fonte da verdade é o banco local (SQLite); o estado é só um espelho dele.
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>('Início');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sync, setSync] = useState<SyncState>({ isOnline: true, isSyncing: false, pending: 0, lastSync: null, message: '' });
  const syncingRef = useRef(false);
  const onlineRef = useRef(true);

  const reload = useCallback(async () => {
    const [v, o, queue] = await Promise.all([database.getVehicles(), database.getOrders(), database.getSyncQueue()]);
    setVehicles(v);
    setOrders(o);
    setSync(cur => ({ ...cur, pending: queue.length }));
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSync(cur => ({ ...cur, isSyncing: true, message: '' }));
    const result = await syncPending();
    const lastSync = await preferences.getLastSync();
    const queue = await database.getSyncQueue();
    syncingRef.current = false;
    setSync(cur => ({
      ...cur, isSyncing: false, pending: queue.length, lastSync,
      message: result.error ? result.error : result.sent ? `${result.sent} alteração(ões) enviada(s) ao servidor.` : 'Tudo sincronizado.',
    }));
  }, []);

  // Inicialização: abre o banco, lê preferências e restaura a sessão.
  useEffect(() => {
    (async () => {
      try {
        await database.init();
        const [session, lastTab, lastSync] = await Promise.all([preferences.getSession(), preferences.getLastTab(), preferences.getLastSync()]);
        await reload();
        setIsAuthenticated(!!session);
        if (lastTab) setTab(lastTab);
        setSync(cur => ({ ...cur, lastSync }));
      } catch (error) {
        Alert.alert('Erro ao abrir o banco local', String(error));
      } finally {
        setReady(true);
      }
    })();
  }, [reload]);

  // Monitora a conexão e sincroniza automaticamente quando a internet volta.
  useEffect(() => NetInfo.addEventListener(state => {
    const online = !!state.isConnected && state.isInternetReachable !== false;
    const cameBack = online && !onlineRef.current;
    onlineRef.current = online;
    setSync(cur => ({ ...cur, isOnline: online }));
    if (cameBack) syncNow();
  }), [syncNow]);

  // Toda alteração: grava no SQLite → atualiza a tela → tenta sincronizar.
  async function persist(action: () => Promise<void>) {
    try {
      await action();
      await reload();
      if (onlineRef.current) syncNow();
    } catch (error) {
      Alert.alert('Não foi possível salvar', String(error));
    }
  }

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => persist(() => database.insertVehicle(vehicle));
  const removeVehicle = (id: number) => persist(() => database.deleteVehicle(id));
  const addOrder = (vehicleId: number, service: string, totalCents: number, costCents: number) =>
    persist(() => database.insertOrder({ vehicleId, service, totalCents, costCents, status: 'Aberta' }));
  const removeOrder = (id: number) => persist(() => database.deleteOrder(id));
  function advanceOrder(id: number) {
    const order = orders.find(item => item.id === id);
    if (order) persist(() => database.updateOrderStatus(id, NEXT_STATUS[order.status]));
  }

  function changeTab(next: Tab) {
    setTab(next);
    preferences.saveLastTab(next);
  }

  async function login(email: string) {
    await preferences.saveSession(email);
    setIsAuthenticated(true);
  }

  async function logout() {
    await preferences.clearSession();
    setIsAuthenticated(false);
    changeTab('Início');
  }

  if (!ready) return <SafeAreaProvider>
    <View style={s.splash}>
      <Image source={require('./assets/images/logo.png')} style={s.loginLogo} resizeMode="contain" />
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={s.subtitle}>Carregando dados salvos no aparelho...</Text>
    </View>
  </SafeAreaProvider>;

  return <SafeAreaProvider>
    <SafeAreaView style={[s.page, Platform.OS === 'web' && ({ height: '100vh' } as any)]}>
      <StatusBar style="dark" />
      {!isAuthenticated ? <LoginScreen onLogin={login} /> : <>
        {!sync.isOnline && <View style={s.offlineBanner} accessibilityRole="alert">
          <Text style={s.offlineText}>Modo offline · as alterações ficam salvas no aparelho ({sync.pending} pendente(s))</Text>
        </View>}
        <View style={s.page}>
          {tab === 'Início' && <HomeScreen vehicles={vehicles} orders={orders} sync={sync} onSync={syncNow} onNavigate={changeTab} onLogout={logout} />}
          {tab === 'Frota' && <FleetScreen vehicles={vehicles} onAdd={addVehicle} onRemove={removeVehicle} />}
          {tab === 'Ordens' && <OrdersScreen vehicles={vehicles} orders={orders} onAdd={addOrder} onAdvance={advanceOrder} onRemove={removeOrder} />}
        </View>
        <View style={s.navigation} accessibilityRole="tablist">
          {(['Início', 'Frota', 'Ordens'] as Tab[]).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: item === tab }} onPress={() => changeTab(item)} style={[s.tab, tab === item && s.activeTab]}>
            <Text style={[s.tabText, tab === item && s.secondaryText]}>{item}</Text>
          </Pressable>)}
        </View>
      </>}
    </SafeAreaView>
  </SafeAreaProvider>;
}
