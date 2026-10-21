// Busca de marca/modelo na Tabela FIPE (API REST) com indicador de carregamento.
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { fetchTruckBrands, fetchTruckModels, FipeItem } from './api/fipe';
import { Button } from './components';
import { styles as s } from './styles';

export function FipePicker({ onSelect }: { onSelect: (model: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [brands, setBrands] = useState<FipeItem[]>([]);
  const [brand, setBrand] = useState<FipeItem | null>(null);
  const [models, setModels] = useState<FipeItem[]>([]);
  const [filter, setFilter] = useState('');

  async function loadBrands() {
    setOpen(true); setError(''); setNotice(''); setBrand(null); setModels([]); setFilter(''); setLoading(true);
    try {
      const result = await fetchTruckBrands();
      setBrands(result.brands);
      if (result.fromCache) setNotice('Sem internet: exibindo marcas salvas no aparelho.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function chooseBrand(item: FipeItem) {
    setBrand(item); setFilter(''); setError(''); setLoading(true);
    try {
      setModels(await fetchTruckModels(item.codigo));
    } catch (e) {
      setError((e as Error).message);
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }

  function chooseModel(item: FipeItem) {
    onSelect(`${brand?.nome ?? ''} ${item.nome}`.trim());
    setOpen(false);
  }

  if (!open) return <Button title="Buscar modelo na Tabela FIPE" onPress={loadBrands} secondary />;

  const list = (brand ? models : brands).filter(item => item.nome.toLowerCase().includes(filter.trim().toLowerCase()));

  return <View style={s.fipeBox}>
    <View style={s.between}>
      <Text style={s.label}>{brand ? `Modelos ${brand.nome}` : 'Marcas de caminhões (FIPE)'}</Text>
      <Pressable onPress={() => (brand ? setBrand(null) : setOpen(false))} hitSlop={8}>
        <Text style={s.secondaryText}>{brand ? '‹ Marcas' : 'Fechar'}</Text>
      </Pressable>
    </View>
    {loading ? <View style={s.syncing}>
      <ActivityIndicator color="#007AFF" />
      <Text style={s.secondaryText}>Consultando a Tabela FIPE...</Text>
    </View> : <>
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!!error && <Button title="Tentar novamente" onPress={loadBrands} secondary />}
      {!!notice && <Text style={s.subtitle}>{notice}</Text>}
      {!error && <>
        <TextInput style={s.input} placeholder={brand ? 'Filtrar modelo' : 'Filtrar marca'} placeholderTextColor="#64748B" value={filter} onChangeText={setFilter} />
        <ScrollView style={s.fipeList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {list.map(item => <Pressable key={item.codigo} onPress={() => (brand ? chooseModel(item) : chooseBrand(item))} style={({ pressed }) => [s.fipeItem, pressed && { backgroundColor: '#EAF2FF' }]}>
            <Text style={s.text}>{item.nome}</Text>
          </Pressable>)}
          {list.length === 0 && <Text style={s.subtitle}>Nenhum resultado.</Text>}
        </ScrollView>
      </>}
    </>}
  </View>;
}
