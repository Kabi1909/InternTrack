const listeners = new Set();
export function subscribeRefresh(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export async function refreshData() {
  await Promise.all([...listeners].map((listener) => listener()));
}
export async function mutateRequest(request) {
  const response = await request;
  await refreshData();
  return response.data.data;
}
export async function fetchAll(api, endpoint, params = {}, signal) {
  const records = [];
  let page = 1;
  let pages = 1;
  do {
    const response = await api.get(endpoint, {
      params: { ...params, page, limit: 100 },
      signal,
    });
    records.push(...response.data.data);
    pages = response.data.pagination?.pages || 1;
    page += 1;
  } while (page <= pages);
  return records;
}
