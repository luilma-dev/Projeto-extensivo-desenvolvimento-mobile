import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { formatBRL, Order, Vehicle } from '../data';
import { Badge, Button, Field, FormModal, IconButton } from '../components';
import { styles as s } from '../styles';

export function OrdersScreen({ vehicles, orders, onAdd, onAdvance, onRemove }: { vehicles: Vehicle[]; orders: Order[]; onAdd: (vehicleId: number, service: string, totalCents: number, costCents: number) => void; onAdvance: (id: number) => void; onRemove: (id: number) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [service, setService] = useState('');
  const [total, setTotal] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');

  function parseMoney(value: string) {
    const normalized = value.replace(/\s/g, '').replace(/^R\$/i, '');
    if (!normalized) return Number.NaN;

    // Aceita o padrão brasileiro (1.234,56) e também 1234.56.
    const decimal = normalized.includes(',')
      ? normalized.replace(/\./g, '').replace(',', '.')
      : /^\d{1,3}(\.\d{3})+$/.test(normalized)
        ? normalized.replace(/\./g, '')
        : normalized;
    const amount = Number(decimal);
    return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
  }

  function save() {
    const totalCents = parseMoney(total);
    const costCents = parseMoney(cost);
    if (vehicleId === null || !vehicles.some(vehicle => vehicle.id === vehicleId)) return setError('Selecione o veículo que receberá o serviço.');
    if (service.trim().length < 3) return setError('Descreva o serviço com pelo menos três caracteres.');
    if (!Number.isFinite(totalCents) || totalCents <= 0) return setError('Informe um valor cobrado maior que zero.');
    if (!Number.isFinite(costCents) || costCents < 0) return setError('Informe um custo válido (pode ser zero).');
    onAdd(vehicleId, service.trim(), totalCents, costCents);
    setShowForm(false);
  }

  function openForm() {
    setVehicleId(null); setService(''); setTotal(''); setCost(''); setError(''); setShowForm(true);
  }

  function confirmRemove(id: number) {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm ? window.confirm('Deseja realmente excluir esta ordem de serviço?') : true;
      if (confirmed) onRemove(id);
    } else {
      Alert.alert(
        'Excluir ordem',
        'Deseja realmente remover esta ordem de serviço?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => onRemove(id) },
        ]
      );
    }
  }

  return <>
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.title}>Ordens</Text>
      <Text style={s.subtitle}>Da chegada do veículo ao serviço concluído.</Text>
      <Button title="+ Nova ordem de serviço" onPress={openForm} />
      <Text style={s.subtitle}>{orders.length} ordem(ns) de serviço</Text>
      {orders.map(order => {
        const vehicle = vehicles.find(item => item.id === order.vehicleId);
        return <View key={order.id} style={s.card}>
          <View style={s.between}>
            <Text style={s.label}>OS #{String(order.id).padStart(3, '0')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Badge status={order.status} />
              <IconButton onPress={() => confirmRemove(order.id)} accessibilityLabel="Excluir ordem" />
            </View>
          </View>
          <Text style={s.heading}>{vehicle?.plate}</Text>
          <Text style={s.subtitle}>{vehicle?.model} · {vehicle?.owner}</Text>
          <Text style={s.text}>{order.service}</Text>
          <View style={s.moneyRow}>
            <View style={s.moneyItem}><Text style={s.moneyLabel}>Total da OS</Text><Text style={s.moneyValue}>{formatBRL(order.totalCents)}</Text></View>
            <View style={s.moneyItem}><Text style={s.moneyLabel}>Custo</Text><Text style={s.moneyValue}>{formatBRL(order.costCents)}</Text></View>
            <View style={s.moneyItem}><Text style={s.moneyLabel}>Lucro</Text><Text style={[s.moneyValue, order.totalCents - order.costCents < 0 && s.negative]}>{formatBRL(order.totalCents - order.costCents)}</Text></View>
          </View>
          {order.status !== 'Concluída' && <Button title={order.status === 'Aberta' ? 'Iniciar serviço' : 'Concluir serviço'} onPress={() => onAdvance(order.id)} secondary />}
        </View>;
      })}
      {orders.length === 0 && <View style={s.card}><Text style={s.text}>Nenhuma ordem. Abra o primeiro serviço acima.</Text></View>}
    </ScrollView>
    {showForm && <FormModal title="Nova ordem" onClose={() => setShowForm(false)}>
      <Text style={s.subtitle}>Selecione o veículo</Text>
      {vehicles.length === 0 && <Text style={s.text}>Cadastre um veículo na aba Frota antes de abrir uma ordem.</Text>}
      {vehicles.map(vehicle => <Pressable key={vehicle.id} accessibilityRole="radio" accessibilityState={{ checked: vehicle.id === vehicleId }} onPress={() => setVehicleId(vehicle.id)} style={[s.option, vehicle.id === vehicleId && s.selected]}>
        <Text style={s.label}>{vehicle.id === vehicleId ? '✓ ' : ''}{vehicle.plate}</Text><Text style={s.subtitle}>{vehicle.model}</Text>
      </Pressable>)}
      <Field label="Serviço a realizar" value={service} onChangeText={setService} />
      <Field label="Valor cobrado (R$)" value={total} onChangeText={setTotal} keyboardType="decimal-pad" placeholder="Ex.: 1.500,00" />
      <Field label="Custo do serviço (R$)" value={cost} onChangeText={setCost} keyboardType="decimal-pad" placeholder="Ex.: 850,00" />
      {Number.isFinite(parseMoney(total)) && Number.isFinite(parseMoney(cost)) && <View style={s.profitPreview}>
        <Text style={s.moneyLabel}>Lucro previsto</Text>
        <Text style={[s.heading, parseMoney(total) - parseMoney(cost) < 0 && s.negative]}>{formatBRL(parseMoney(total) - parseMoney(cost))}</Text>
      </View>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Button title="Criar ordem" onPress={save} />
    </FormModal>}
  </>;
}
