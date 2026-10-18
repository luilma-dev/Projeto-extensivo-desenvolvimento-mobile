// Banco de dados relacional embarcado (SQLite via expo-sqlite).
// Todas as escritas acontecem primeiro aqui (offline-first). Cada alteração
// também gera um registro na tabela `sync_queue`, que é enviada à API quando
// houver internet (padrão "outbox").
import * as SQLite from 'expo-sqlite';
import { initialOrders, initialVehicles, Order, Status, SyncAction, SyncEntity, SyncItem, Vehicle } from '../data';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) dbPromise = openAndMigrate();
  return dbPromise;
}

async function openAndMigrate() {
  const db = await SQLite.openDatabaseAsync('truckflow.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate TEXT NOT NULL UNIQUE,
      model TEXT NOT NULL,
      owner TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      service TEXT NOT NULL,
      status TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      cost_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Primeira execução: popula com os exemplos (já considerados sincronizados).
  const row = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM vehicles');
  if (!row?.total) {
    await db.withTransactionAsync(async () => {
      for (const v of initialVehicles) {
        await db.runAsync('INSERT INTO vehicles (id, plate, model, owner) VALUES (?, ?, ?, ?)', v.id, v.plate, v.model, v.owner);
      }
      for (const o of initialOrders) {
        await db.runAsync(
          'INSERT INTO orders (id, vehicle_id, service, status, total_cents, cost_cents) VALUES (?, ?, ?, ?, ?, ?)',
          o.id, o.vehicleId, o.service, o.status, o.totalCents, o.costCents,
        );
      }
    });
  }
  return db;
}

async function enqueue(db: SQLite.SQLiteDatabase, entity: SyncEntity, action: SyncAction, payload: object) {
  await db.runAsync('INSERT INTO sync_queue (entity, action, payload) VALUES (?, ?, ?)', entity, action, JSON.stringify(payload));
}

type OrderRow = { id: number; vehicle_id: number; service: string; status: Status; total_cents: number; cost_cents: number };
type SyncRow = { id: number; entity: SyncEntity; action: SyncAction; payload: string; created_at: string };

export const database = {
  init: () => getDb().then(() => undefined),

  async getVehicles(): Promise<Vehicle[]> {
    const db = await getDb();
    return db.getAllAsync<Vehicle>('SELECT id, plate, model, owner FROM vehicles ORDER BY id');
  },

  async getOrders(): Promise<Order[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<OrderRow>('SELECT * FROM orders ORDER BY id DESC');
    return rows.map(r => ({ id: r.id, vehicleId: r.vehicle_id, service: r.service, status: r.status, totalCents: r.total_cents, costCents: r.cost_cents }));
  },

  async insertVehicle(vehicle: Omit<Vehicle, 'id'>) {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      const { lastInsertRowId } = await db.runAsync('INSERT INTO vehicles (plate, model, owner) VALUES (?, ?, ?)', vehicle.plate, vehicle.model, vehicle.owner);
      await enqueue(db, 'vehicle', 'create', { id: lastInsertRowId, ...vehicle });
    });
  },

  async deleteVehicle(id: number) {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM orders WHERE vehicle_id = ?', id);
      await db.runAsync('DELETE FROM vehicles WHERE id = ?', id);
      await enqueue(db, 'vehicle', 'delete', { id });
    });
  },

  async insertOrder(order: Omit<Order, 'id'>) {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO orders (vehicle_id, service, status, total_cents, cost_cents) VALUES (?, ?, ?, ?, ?)',
        order.vehicleId, order.service, order.status, order.totalCents, order.costCents,
      );
      await enqueue(db, 'order', 'create', { id: lastInsertRowId, ...order });
    });
  },

  async updateOrderStatus(id: number, status: Status) {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', status, id);
      await enqueue(db, 'order', 'update', { id, status });
    });
  },

  async deleteOrder(id: number) {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM orders WHERE id = ?', id);
      await enqueue(db, 'order', 'delete', { id });
    });
  },

  async getSyncQueue(): Promise<SyncItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<SyncRow>('SELECT * FROM sync_queue ORDER BY id');
    return rows.map(r => ({ id: r.id, entity: r.entity, action: r.action, payload: JSON.parse(r.payload), createdAt: r.created_at }));
  },

  async removeFromQueue(id: number) {
    const db = await getDb();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
  },
};
