// Sends a best-effort Expo push notification. Push is deliberately isolated from
// queue mutations: a notification outage must never stop the line moving.
async function notifyTicketCalled(ticket, queueName) {
  const pushUrl = process.env.EXPO_PUSH_URL;
  if (!pushUrl || !ticket || !ticket.expoPushToken) return;

  try {
    const response = await fetch(pushUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: ticket.expoPushToken,
        sound: 'default',
        title: 'It is your turn',
        body: `Number ${ticket.number} at ${queueName}. Go to the counter now.`,
        data: { ticketId: ticket.id },
      }),
    });
    if (!response.ok) console.error('Push notification failed:', response.status);
  } catch (error) {
    console.error('Push notification failed:', error.message);
  }
}

module.exports = { notifyTicketCalled };
