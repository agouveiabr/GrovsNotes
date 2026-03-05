const QUEUE_KEY = 'grovsnotes_offline_queue';

export function getOfflineQueue(): Array<any> {
  const raw = localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addToOfflineQueue(item: any) {
  const queue = getOfflineQueue();
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export async function syncOfflineQueue(
  createFn: (data: any) => Promise<unknown>
) {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  for (const item of queue) {
    await createFn(item);
  }
  clearOfflineQueue();
}
