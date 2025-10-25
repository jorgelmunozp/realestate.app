// Merge optimistic items into a server list and reconcile pending ones
// pending = array of { action: 'created'|'updated', property, image? }
// key = unique identifier field (default: 'idProperty')

export const mergeOptimistic = (serverList = [], pending = [], key = 'idProperty') => {
  const byId = new Map(serverList.map((item) => [item?.[key], item]));

  const merged = [...serverList];
  const remaining = [];

  for (const p of pending) {
    const opt = p || {};
    const prop = opt.property || {};
    const id = prop?.[key];
    if (!id) {
      // no id to reconcile; keep pending as is
      remaining.push(opt);
      continue;
    }

    if (byId.has(id)) {
      // already present in server list; optionally merge fields for 'updated'
      if (opt.action === 'updated') {
        const idx = merged.findIndex((x) => x?.[key] === id);
        if (idx !== -1) {
          merged[idx] = {
            ...merged[idx],
            ...prop,
            image: opt.image ? opt.image : merged[idx].image,
          };
        }
      }
      // remove from pending as it’s now reflected
      continue;
    }

    // Not in server list yet: insert optimistically at the top
    merged.unshift({ ...prop, image: opt.image || null });
    byId.set(id, prop);
    // keep it pending until the server eventually returns it
    remaining.push(opt);
  }

  return { merged, remaining };
};

export default mergeOptimistic;

