// Sincronização offline-first: envia a fila local (sync_queue) para a API.
// Cada item só sai da fila depois que o servidor confirma o recebimento,
// então nada se perde se a internet cair no meio do envio.
//
// API_URL usa o JSONPlaceholder (servidor REST público de testes, que aceita
// POST e devolve 201). Para usar um back-end real da equipe, troque a URL.
import { request } from './client';
import { database } from '../storage/database';
import { preferences } from '../storage/preferences';

export const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export type SyncResult = { sent: number; failed: number; error?: string };

export async function syncPending(): Promise<SyncResult> {
  const queue = await database.getSyncQueue();
  let sent = 0;
  for (const item of queue) {
    try {
      await request(API_URL, {
        method: 'POST',
        body: JSON.stringify({ entity: item.entity, action: item.action, data: item.payload, createdAt: item.createdAt }),
      });
      await database.removeFromQueue(item.id);
      sent++;
    } catch (error) {
      // Interrompe e mantém o restante na fila para a próxima tentativa.
      return { sent, failed: queue.length - sent, error: (error as Error).message };
    }
  }
  await preferences.saveLastSync(new Date().toISOString());
  return { sent, failed: 0 };
}
