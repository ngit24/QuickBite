export const sendNotification = async (
  userEmail: string,
  type: string,
  message: string,
  orderId: string,
  token: string
) => {
  try {
    const response = await fetch('https://localhost969.pythonanywhere.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        user_email: userEmail,
        type,
        message,
        order_id: orderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

export const formatOrderStatus = (status: string): string => {
  const statusMessages = {
    ready: '🍽️ Your order is ready for pickup!',
    cancelled: '❌ Your order has been cancelled',
    completed: '✅ Order completed',
  };
  return statusMessages[status] || status;
};
