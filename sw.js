// Nama cache unik untuk aplikasi Anda. Ubah jika ada perubahan besar pada file.
const CACHE_NAME = 'timesheet-epm-cache-v1.3'; // Naikkan versi cache

// Dapatkan nama repository dari URL untuk path yang benar di GitHub Pages
const repoName = new URL(self.location).pathname.split('/')[1] || '';
const BASE_URL = `/${repoName}`;

// Daftar file inti yang harus di-cache
const urlsToCache = [
  `${BASE_URL}/`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/css/inter-font.css`,
  `${BASE_URL}/css/fontawesome.min.css`,
  `${BASE_URL}/js/tailwindcss.js`,
  `${BASE_URL}/js/jspdf.umd.min.js`,
  `${BASE_URL}/js/jspdf.plugin.autotable.min.js`,
  // FILE BARU DITAMBAHKAN DI SINI
  `${BASE_URL}/js/supabase.min.js.js`,
  // Pastikan path ke webfonts ini benar sesuai struktur folder Anda
  `${BASE_URL}/webfonts/fa-solid-900.woff2`,
  `${BASE_URL}/webfonts/fa-regular-400.woff2`,
  `${BASE_URL}/webfonts/fa-brands-400.woff2`,
  // Tambahkan path ke file ikon Anda
  `${BASE_URL}/Icona/icon.png`
];

// Event 'install': Dipicu saat service worker pertama kali diinstal.
self.addEventListener('install', event => {
  console.log('Service Worker: Menginstal...');
  // Menunggu hingga semua file inti berhasil di-cache.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Membuka cache dan menambahkan file inti.');
        // Skip waiting untuk mempercepat aktivasi service worker baru
        self.skipWaiting(); 
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Gagal menambahkan file ke cache saat instalasi.', error);
      })
  );
});

// Event 'fetch': Dipicu setiap kali aplikasi meminta sebuah resource (file, gambar, dll).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          }
        ).catch(error => {
            console.error('Service Worker: Gagal mengambil dari jaringan.', error);
        });
      })
  );
});

// Event 'activate': Dipicu setelah instalasi selesai. Berguna untuk membersihkan cache lama.
self.addEventListener('activate', event => {
  console.log('Service Worker: Mengaktifkan...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Mengambil kontrol halaman yang terbuka
  );
});
