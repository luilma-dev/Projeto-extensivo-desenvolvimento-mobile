// Consumo de API REST pública: Tabela FIPE (marcas e modelos de caminhões).
// Documentação: https://deividfortuna.github.io/fipe/
// As marcas são guardadas em cache no AsyncStorage para funcionar offline.
import { request } from './client';
import { preferences } from '../storage/preferences';

const FIPE_URL = 'https://parallelum.com.br/fipe/api/v1/caminhoes';

export type FipeItem = { codigo: string; nome: string };

export async function fetchTruckBrands(): Promise<{ brands: FipeItem[]; fromCache: boolean }> {
  try {
    const brands = await request<FipeItem[]>(`${FIPE_URL}/marcas`);
    await preferences.saveCachedBrands(brands);
    return { brands, fromCache: false };
  } catch (error) {
    const cached = await preferences.getCachedBrands<FipeItem[]>();
    if (cached?.length) return { brands: cached, fromCache: true };
    throw error;
  }
}

export async function fetchTruckModels(brandCode: string): Promise<FipeItem[]> {
  const data = await request<{ modelos: { codigo: number; nome: string }[] }>(`${FIPE_URL}/marcas/${brandCode}/modelos`);
  return data.modelos.map(m => ({ codigo: String(m.codigo), nome: m.nome }));
}
