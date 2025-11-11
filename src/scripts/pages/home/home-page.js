import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllStories } from '../../data/api';
import { showFormattedDate } from '../../utils';
import { isLoggedIn } from '../../utils/auth';
import Idb from '../../data/idb';

import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar Story</h1>
        <div id="map" style="height: 400px; margin-bottom: 24px;"></div>
        <div id="storiesList" class="stories-list">
          <p>Sedang memuat story...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storiesContainer = document.querySelector('#storiesList');
    const map = L.map('map').setView([-6.200000, 106.816666], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    if (!isLoggedIn()) {
      storiesContainer.innerHTML = `
        <p>Anda belum login. Silakan <a href="#/login">login</a> untuk melihat story.</p>
      `;
      return;
    }

    const token = localStorage.getItem('authToken');
    let stories = [];

    try {
      if (navigator.onLine) {
        console.log('Mode online: ambil data dari API...');
        const response = await getAllStories(token, 1, 10, 0);

        if (!response || response.error) {
          throw new Error(response?.message || 'Gagal memuat story.');
        }

        stories = response.listStory || [];

        await Idb.clearAllStories();
        for (const story of stories) {
          await Idb.putStory(story);
        }
      } else {
        console.log('Mode offline: ambil data dari IndexedDB...');
        stories = await Idb.getAllStories();

        const offlineMsg = document.createElement('p');
        offlineMsg.textContent = '(Menampilkan data offline)';
        offlineMsg.style.color = 'gray';
        storiesContainer.before(offlineMsg);
      }

      if (stories.length === 0) {
        storiesContainer.innerHTML = '<p>Belum ada story.</p>';
        return;
      }

      const storyItems = stories
        .map(
          (story) => `
            <article class="story-item">
              <a href="#/detail/${story.id}" class="story-link">
                <img src="${story.photoUrl}" alt="Foto story oleh ${story.name}" class="story-image" />
                <div class="story-info">
                  <h3>${story.name}</h3>
                  <p>${story.description}</p>
                  <p class="story-date">${showFormattedDate(story.createdAt, 'id-ID')}</p>
                </div>
              </a>
            </article>
          `
        )
        .join('');

      storiesContainer.innerHTML = storyItems;

      stories.forEach((story) => {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.marker([lat, lon]).addTo(map);
          marker.bindPopup(`
            <strong>${story.name}</strong><br />
            ${story.description}<br />
            <a href="#/detail/${story.id}">Lihat Detail</a>
          `);
        }
      });
    } catch (error) {
      console.error('Error memuat data:', error);
      storiesContainer.innerHTML = '<p>Terjadi kesalahan saat memuat data.</p>';
    }
  }
}