export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
export const initials = (name) =>
  name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('') || 'IT';
export function downloadText(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function calendarDownload(interview, title) {
  const start = (interview.date + 'T' + interview.time + ':00').replace(/[-:]/g, '');
  downloadText(
    'interntrack-interview.ics',
    `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//InternTrack//EN\r\nBEGIN:VEVENT\r\nUID:${interview.id}@interntrack.demo\r\nDTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(
        /\.\d{3}/,
        '',
      )}\r\nDTSTART:${start}\r\nDURATION:PT1H\r\nSUMMARY:${title.replace(/[,;\n]/g, ' ')}\r\nLOCATION:${interview.link || interview.location || ''}\r\nEND:VEVENT\r\nEND:VCALENDAR`,
    'text/calendar',
  );
}
export const safeUrl = (value) => (/^https?:\/\//i.test(value || '') ? value : undefined);
