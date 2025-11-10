import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllStories } from '../../data/api';
import { showFormattedDate } from '../../utils';
import { isLoggedIn } from '../../utils/auth';

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

    try {
      const response = await getAllStories(token, 1, 10, 0);
      console.log('Response getAllStories:', response);

      if (!response || response.error) {
        storiesContainer.innerHTML = `<p>Gagal memuat story: ${response?.message || 'Tidak diketahui.'}</p>`;
        return;
      }

      const stories = response.listStory || [];

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
