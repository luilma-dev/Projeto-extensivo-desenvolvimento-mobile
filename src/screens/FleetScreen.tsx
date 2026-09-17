import { useState } from 'react';
import { Alert, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Vehicle } from '../data';
import { Button, Field, FormModal, IconButton } from '../components';
import { styles as s } from '../styles';

export function FleetScreen({ vehicles, onAdd, onRemove }: { vehicles: Vehicle[]; onAdd: (vehicle: Omit<Vehicle, 'id'>) => void; onRemove: (id: number) => void }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [owner, setOwner] = useState('');
  const [error, setError] = useState('');
  const filtered = vehicles.filter(vehicle => `${vehicle.plate} ${vehicle.model} ${vehicle.owner}`.toLowerCase().includes(search.trim().toLowerCase()));

  function save() {
    const normalizedPlate = plate.toUpperCase().replace(/[\s-]/g, '');
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(normalizedPlate)) return setError('Informe uma placa válida, como ABC1D23 ou ABC1234.');
    if (!model.trim() || !owner.trim()) return setError('Preencha o modelo e o nome do cliente.');
    if (vehicles.some(vehicle => vehicle.plate === normalizedPlate)) return setError('Essa placa já está cadastrada.');
    onAdd({ plate: normalizedPlate, model: model.trim(), owner: owner.trim() });
    setSearch('');
    setShowForm(false);
  }

  function openForm() {
    setPlate(''); setModel(''); setOwner(''); setError(''); setShowForm(true);
  }

  function confirmRemove(id: number, plateText: string) {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm ? window.confirm(`Deseja realmente excluir o veículo ${plateText}? As ordens de serviço vinculadas a ele também serão excluídas.`) : true;
      if (confirmed) onRemove(id);
    } else {
      Alert.alert(
        'Excluir veículo',
        `Deseja realmente excluir o veículo ${plateText}? As ordens de serviço vinculadas a ele também serão excluídas.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => onRemove(id) },
        ]
      );
    }
  }

  return <>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Frota</Text>
      <Text style={s.subtitle}>Os veículos e clientes da sua oficina.</Text>
      <TextInput style={s.input} placeholder="Buscar placa ou modelo" placeholderTextColor="#64748B" accessibilityLabel="Buscar veículos" value={search} onChangeText={setSearch} />
      <Button title="+ Cadastrar veículo" onPress={openForm} />
      <Text style={s.subtitle}>{filtered.length} veículo(s) encontrado(s)</Text>
      {filtered.map(vehicle => <View key={vehicle.id} style={s.card}>
        <View style={s.between}>
          <Text style={s.heading}>{vehicle.plate}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={s.badge}><Text style={s.badgeText}>Frota</Text></View>
            <IconButton onPress={() => confirmRemove(vehicle.id, vehicle.plate)} accessibilityLabel="Excluir veículo" />
          </View>
        </View>
        <Text style={s.text}>{vehicle.model}</Text>
        <Text style={s.subtitle}>Cliente: {vehicle.owner}</Text>
      </View>)}
      {filtered.length === 0 && <View style={s.card}><Text style={s.text}>Nenhum veículo encontrado. Tente outra busca ou cadastre um veículo.</Text></View>}
    </ScrollView>
    {showForm && <FormModal title="Novo veículo" onClose={() => setShowForm(false)}>
      <Text style={s.subtitle}>Só três informações para começar.</Text>
      <Field label="Placa" value={plate} onChangeText={setPlate} uppercase />
      <Field label="Marca e modelo" value={model} onChangeText={setModel} />
      <Field label="Nome do cliente" value={owner} onChangeText={setOwner} />
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Button title="Salvar veículo" onPress={save} />
    </FormModal>}
  </>;
}
