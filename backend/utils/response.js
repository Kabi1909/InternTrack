export const success = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });
export function list(res, data, total, page, limit) {
  return res.json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
export const pagination = (query) => ({
  page: Number(query.page || 1),
  limit: Number(query.limit || 10),
  skip: (Number(query.page || 1) - 1) * Number(query.limit || 10),
});
export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const pick = (source, keys) =>
  Object.fromEntries(
    keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]),
  );
export function serializeApplication(document, role) {
  const object = document.toJSON ? document.toJSON() : { ...document };
  delete object[role === 'student' ? 'providerNotes' : 'personalNotes'];
  return object;
}
