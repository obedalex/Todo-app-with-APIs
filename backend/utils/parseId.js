export function parseId(id) {
  const parsed = parseInt(id);
  if (isNaN(parsed)) {
    return null;
  }
  return parsed;
}