// Nama cache unik untuk aplikasi Anda. Ubah jika ada perubahan besar pada file.
const CACHE_NAME = 'timesheet-epm-cache-v1.2'; 

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
  // Pastikan path ke webfonts ini benar sesuai struktur folder Anda
  `${BASE_URL}/webfonts/fa-solid-900.woff2`,
  `${BASE_URL}/webfonts/fa-regular-400.woff2`,
  `${BASE_URL}/webfonts/fa-brands-400.woff2`
];

// Event 'install': Dipicu saat service worker pertama kali diinstal.
self.addEventListener('install', event => {
  console.log('Service Worker: Menginstal...');
  // Menunggu hingga semua file inti berhasil di-cache.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Membuka cache dan menambahkan file inti.');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Gagal menambahkan file ke cache saat instalasi.', error);
      })
  );
});

// Event 'fetch': Dipicu setiap kali aplikasi meminta sebuah resource (file, gambar, dll).
self.addEventListener('fetch', event => {
  // Hanya tangani permintaan GET (bukan POST ke Supabase, dll)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // Coba cari resource di cache terlebih dahulu.
    caches.match(event.request)
      .then(cachedResponse => {
        // Jika ditemukan di cache, langsung kembalikan dari cache.
        if (cachedResponse) {
          // console.log('Service Worker: Mengambil dari cache:', event.request.url);
          return cachedResponse;
        }

        // Jika tidak ada di cache, coba ambil dari internet.
        // console.log('Service Worker: Mengambil dari jaringan:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Jika berhasil diambil dari internet, simpan salinannya ke cache untuk lain waktu.
            return caches.open(CACHE_NAME).then(cache => {
              // Pastikan response valid sebelum di-cache
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          }
        ).catch(error => {
            // Jika gagal mengambil dari cache dan juga dari jaringan,
            // ini akan menghasilkan halaman error "Anda offline" dari browser.
            console.error('Service Worker: Gagal mengambil dari jaringan dan tidak ada di cache.', error);
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
    })
  );
});
