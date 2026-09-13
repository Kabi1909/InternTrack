// Deliberately disabled until an email provider and sender identity are configured.
// Do not log recipient addresses or credentials. Callers can replace this adapter.
export async function sendEmail() {
  return { sent: false, reason: 'Email delivery is not configured.' };
}
