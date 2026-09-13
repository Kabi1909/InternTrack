import api from './api.js';
export async function uploadDataUrl(endpoint, dataUrl, name = 'upload') {
  const [header, encoded] = dataUrl.split(',');
  const type = header.match(/^data:([^;]+);base64$/)?.[1];
  if (!type || !encoded) throw new Error('Select a valid file before uploading.');
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  const form = new FormData();
  form.append('file', new Blob([bytes], { type }), name);
  return (await api.post(endpoint, form)).data.data;
}
export async function downloadCV(url, name = 'CV.pdf') {
  if (!/^\/api\/uploads\/[a-f0-9]{24}$/i.test(url || ''))
    throw new Error('This application has no downloadable CV.');
  const response = await api.get(url.slice(4), { responseType: 'blob' });
  const blobUrl = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
