import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { initialOrders, initialVehicles, Order, Tab, Vehicle } from './src/data';
import { HomeScreen } from './src/screens/HomeScreen';
import { FleetScreen } from './src/screens/FleetScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { styles as s } from './src/styles';

export default function App() {
  // O estado fica aqui para as três telas compartilharem os mesmos dados.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>('Início');
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  function addVehicle(vehicle: Omit<Vehicle, 'id'>) {
    setVehicles(current => [...current, { ...vehicle, id: Math.max(0, ...current.map(item => item.id)) + 1 }]);
  }

  function removeVehicle(id: number) {
    setVehicles(current => current.filter(vehicle => vehicle.id !== id));
    setOrders(current => current.filter(order => order.vehicleId !== id));
  }

  function addOrder(vehicleId: number, service: string, totalCents: number, costCents: number) {
    setOrders(current => [{ id: Math.max(0, ...current.map(item => item.id)) + 1, vehicleId, service, totalCents, costCents, status: 'Aberta' }, ...current]);
  }

  function advanceOrder(id: number) {
    setOrders(current => current.map(order => order.id !== id ? order : {
      ...order, status: order.status === 'Aberta' ? 'Em andamento' : 'Concluída',
    }));
  }

  function removeOrder(id: number) {
    setOrders(current => current.filter(order => order.id !== id));
  }

  function logout() {
    setIsAuthenticated(false);
    setTab('Início');
  }

  return <SafeAreaProvider>
    <SafeAreaView style={[s.page, Platform.OS === 'web' && ({ height: '100vh' } as any)]}>
      <StatusBar style="dark" />
      {!isAuthenticated ? <LoginScreen onLogin={() => setIsAuthenticated(true)} /> : <>
        <View style={s.page}>
          {tab === 'Início' && <HomeScreen vehicles={vehicles} orders={orders} onNavigate={setTab} onLogout={logout} />}
          {tab === 'Frota' && <FleetScreen vehicles={vehicles} onAdd={addVehicle} onRemove={removeVehicle} />}
          {tab === 'Ordens' && <OrdersScreen vehicles={vehicles} orders={orders} onAdd={addOrder} onAdvance={advanceOrder} onRemove={removeOrder} />}
        </View>
        <View style={s.navigation} accessibilityRole="tablist">
          {(['Início', 'Frota', 'Ordens'] as Tab[]).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: item === tab }} onPress={() => setTab(item)} style={[s.tab, tab === item && s.activeTab]}>
            <Text style={[s.tabText, tab === item && s.secondaryText]}>{item}</Text>
          </Pressable>)}
        </View>
      </>}
    </SafeAreaView>
  </SafeAreaProvider>;
}
