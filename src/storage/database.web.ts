// Versão web do repositório (usada automaticamente pelo Metro em `npm run web`).
// O SQLite nativo roda no Android/iOS (Expo Go). No navegador, a mesma
// interface é implementada sobre o AsyncStorage (localStorage), para que a
// demonstração na web continue funcionando com persistência.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialOrders, initialVehicles, Order, Status, SyncAction, SyncEntity, SyncItem, Vehicle } from '../data';

const KEY = '@truckflow:webdb';
type Store = { vehicles: Vehicle[]; orders: Order[]; queue: SyncItem[]; seq: { vehicle: number; order: number; queue: number } };

let cache: Store | null = null;

async function load(): Promise<Store> {
  if (cache) return cache;
  const raw = await AsyncStorage.getItem(KEY);
  cache = raw ? JSON.parse(raw) : {
    vehicles: initialVehicles, orders: initialOrders, queue: [],
    seq: { vehicle: initialVehicles.length, order: initialOrders.length, queue: 0 },
  };
  return cache!;
}

async function mutate(fn: (store: Store) => void) {
  const store = await load();
  fn(store);
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

function enqueue(store: Store, entity: SyncEntity, action: SyncAction, payload: Record<string, unknown>) {
  store.queue.push({ id: ++store.seq.queue, entity, action, payload, createdAt: new Date().toISOString() });
}

export const database = {
  init: () => load().then(() => undefined),
  getVehicles: async () => [...(await load()).vehicles],
  getOrders: async () => [...(await load()).orders].sort((a, b) => b.id - a.id),

  insertVehicle: (vehicle: Omit<Vehicle, 'id'>) => mutate(s => {
    const id = ++s.seq.vehicle;
    s.vehicles.push({ id, ...vehicle });
    enqueue(s, 'vehicle', 'create', { id, ...vehicle });
  }),

  deleteVehicle: (id: number) => mutate(s => {
    s.orders = s.orders.filter(o => o.vehicleId !== id);
    s.vehicles = s.vehicles.filter(v => v.id !== id);
    enqueue(s, 'vehicle', 'delete', { id });
  }),

  insertOrder: (order: Omit<Order, 'id'>) => mutate(s => {
    const id = ++s.seq.order;
    s.orders.push({ id, ...order });
    enqueue(s, 'order', 'create', { id, ...order });
  }),

  updateOrderStatus: (id: number, status: Status) => mutate(s => {
    s.orders = s.orders.map(o => (o.id === id ? { ...o, status } : o));
    enqueue(s, 'order', 'update', { id, status });
  }),

  deleteOrder: (id: number) => mutate(s => {
    s.orders = s.orders.filter(o => o.id !== id);
    enqueue(s, 'order', 'delete', { id });
  }),

  getSyncQueue: async () => [...(await load()).queue],
  removeFromQueue: (id: number) => mutate(s => { s.queue = s.queue.filter(item => item.id !== id); }),
};
