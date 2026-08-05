const QUEUE_KEY = 'driver_delivery_queue_v1';

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function queueDeliveryCompletion(item) {
  const queue = readQueue();
  const exists = queue.some((q) => q.clientSyncId === item.clientSyncId);
  if (exists) return queue;
  queue.push({
    ...item,
    queuedAt: new Date().toISOString(),
  });
  writeQueue(queue);
  return queue;
}

export function getQueuedDeliveries() {
  return readQueue();
}

export function removeQueuedDelivery(clientSyncId) {
  const queue = readQueue().filter((q) => q.clientSyncId !== clientSyncId);
  writeQueue(queue);
  return queue;
}

export function clearDeliveryQueue() {
  localStorage.removeItem(QUEUE_KEY);
}
