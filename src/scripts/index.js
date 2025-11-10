// CSS imports
import '../styles/styles.css';
import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('./scripts/sw.js');
      console.log('Service Worker registered:', registration);

      initPushNotification(registration);
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  } else {
    console.warn('Browser tidak mendukung Service Worker atau Push API');
  }
});

async function initPushNotification(registration) {
  const subscribeButton = document.querySelector('#subscribe-notification');

  if (!subscribeButton) return;

  subscribeButton.addEventListener('click', async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
          ),
        });

        console.log(' Push Subscribed:', JSON.stringify(subscription));
        alert('Notifikasi berhasil diaktifkan!');
      } else if (permission === 'denied') {
        alert(' Izin notifikasi ditolak.');
      } else {
        alert(' Izin notifikasi belum diberikan.');
      }
    } catch (error) {
      console.error('Gagal mengaktifkan notifikasi:', error);
      alert('Terjadi kesalahan saat mengaktifkan notifikasi.');
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}