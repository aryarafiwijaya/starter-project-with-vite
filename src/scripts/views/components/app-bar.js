import { isLoggedIn, logout } from '../../utils/auth';

export default class AppBar {
  async render() {
    return `
      <div class="container app-bar__inner">
        <a href="#/" class="brand-name">Story App</a>

        <button id="drawer-button" class="drawer-button" aria-label="Buka menu">
          ☰
        </button>

        <nav id="navigation-drawer" class="navigation-drawer">
          <ul class="nav-list">
            <li><a href="#/">Beranda</a></li>
            <li><a href="#/about">Tentang</a></li>
            <li><a href="#/add-story">Tambah Story</a></li>
            ${
              isLoggedIn()
                ? `<li><button id="subscribe-notification" class="btn-subscribe">Aktifkan Notifikasi</button></li>
                   <li><button id="logoutBtn" class="btn-logout">Keluar</button></li>`
                : `<li><a href="#/login">Masuk</a></li>
                   <li><a href="#/register">Daftar</a></li>`
            }
          </ul>
        </nav>
      </div>
    `;
  }

  async afterRender() {

    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        window.location.hash = '/login';
      });
    }

    const drawerButton = document.querySelector('#drawer-button');
    const navigationDrawer = document.querySelector('#navigation-drawer');

    if (drawerButton && navigationDrawer) {
      drawerButton.addEventListener('click', () => {
        navigationDrawer.classList.toggle('open');
      });

      document.body.addEventListener('click', (event) => {
        if (
          !navigationDrawer.contains(event.target) &&
          !drawerButton.contains(event.target)
        ) {
          navigationDrawer.classList.remove('open');
        }

        navigationDrawer.querySelectorAll('a').forEach((link) => {
          if (link.contains(event.target)) {
            navigationDrawer.classList.remove('open');
          }
        });
      });
    }

    const subscribeBtn = document.querySelector('#subscribe-notification');
    if (subscribeBtn && 'serviceWorker' in navigator && 'PushManager' in window) {
      subscribeBtn.addEventListener('click', async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            alert('Izin notifikasi ditolak.');
            return;
          }

          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'),
          });
          console.log('Push Subscribed:', subscription);
          alert('Notifikasi berhasil diaktifkan!');
        } catch (err) {
          console.error('Push subscription error:', err);
        }
      });
    }

    function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  }
}
