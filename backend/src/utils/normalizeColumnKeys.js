export function normalizeColumnKeys(row) {
  if (!row || typeof row !== 'object') return row;
  const normalized = { ...row };
  for (const key of Object.keys(row)) {
    if (typeof key === 'string' && key.includes('_')) {
      const noUnderscoreKey = key.replace(/_/g, '');
      if (!(noUnderscoreKey in normalized)) {
        normalized[noUnderscoreKey] = row[key];
      }
    }
  }
  return normalized;
}
