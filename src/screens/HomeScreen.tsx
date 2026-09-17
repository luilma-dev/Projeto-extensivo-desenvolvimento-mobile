import { Image, ScrollView, Text, View } from 'react-native';
import { version } from '../../package.json';
import { formatBRL, Order, Tab, Vehicle } from '../data';
import { Badge, Button } from '../components';
import { styles as s } from '../styles';

export function HomeScreen({ vehicles, orders, onNavigate, onLogout }: { vehicles: Vehicle[]; orders: Order[]; onNavigate: (tab: Tab) => void; onLogout: () => void }) {
  const pending = orders.filter(order => order.status !== 'Concluída');
  const completedOrders = orders.filter(order => order.status === 'Concluída');
  const revenueCents = completedOrders.reduce((sum, order) => sum + order.totalCents, 0);
  const costCents = completedOrders.reduce((sum, order) => sum + order.costCents, 0);
  const profitCents = revenueCents - costCents;
  return <ScrollView contentContainerStyle={s.content}>
    <Image source={require('../../assets/images/logo.png')} style={s.logo} resizeMode="contain" accessibilityLabel="TruckFlow" />
    <View style={{ gap: 6 }}>
      <Text style={s.title}>Resumo Geral</Text>
      <Text style={s.subtitle}>Sua oficina, de um jeito simples.</Text>
    </View>
    <View style={s.stats}>
      <View style={s.stat}><Text style={s.number}>{vehicles.length}</Text><Text style={s.subtitle}>Veículos</Text></View>
      <View style={s.stat}><Text style={s.number}>{pending.length}</Text><Text style={s.subtitle}>Pendentes</Text></View>
    </View>
    <View style={s.financeCard}>
      <Text style={s.financeEyebrow}>LUCRO REALIZADO</Text>
      <Text style={[s.financeTotal, profitCents < 0 && s.negative]}>{formatBRL(profitCents)}</Text>
      <Text style={s.financeCaption}>Calculado sobre {completedOrders.length} OS concluída(s)</Text>
      <View style={s.financeBreakdown}>
        <View style={s.financeItem}><Text style={s.financeLabel}>Faturamento</Text><Text style={s.financeValue}>{formatBRL(revenueCents)}</Text></View>
        <View style={s.financeDivider} />
        <View style={s.financeItem}><Text style={s.financeLabel}>Custos</Text><Text style={s.financeValue}>{formatBRL(costCents)}</Text></View>
      </View>
    </View>
    <View style={s.card}>
      <Text style={s.heading}>Tudo em um só lugar</Text>
      <Text style={s.text}>Cadastre um veículo e acompanhe o serviço até a conclusão.</Text>
      <Button title="Ver ordens de serviço" onPress={() => onNavigate('Ordens')} />
      <Button title="Consultar frota" onPress={() => onNavigate('Frota')} secondary />
    </View>
    <View style={{ gap: 4 }}><Text style={s.heading}>Serviços pendentes</Text><Text style={s.subtitle}>{completedOrders.length} concluído(s)</Text></View>
    {pending.length === 0 && <View style={s.card}><Text style={s.text}>Tudo em dia! Nenhum serviço pendente.</Text></View>}
    {pending.slice(0, 3).map(order => <View key={order.id} style={s.card}>
      <View style={s.between}><Text style={s.heading}>{vehicles.find(vehicle => vehicle.id === order.vehicleId)?.plate}</Text><Badge status={order.status} /></View>
      <Text style={s.text}>{order.service}</Text>
      <Text style={s.orderTotal}>Total da OS: {formatBRL(order.totalCents)}</Text>
    </View>)}
    <Button title="Sair da conta" onPress={onLogout} secondary />
    <Text style={s.subtitle}>TruckFlow {version} · Demonstração acadêmica{'\n'}Dados fictícios. Ao recarregar o app, os exemplos são restaurados.</Text>
  </ScrollView>;
}
