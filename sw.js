const CACHE_NAME = 'timesheet-epm-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/inter-font.css',
    '/css/fontawesome.min.css',
    '/js/tailwindcss.js',
    '/js/jspdf.umd.min.js',
    '/js/jspdf.plugin.autotable.min.js',
    '/manifest.json',
    // Tambahkan path ke file font Anda di sini, contoh:
    '/webfonts/fa-solid-900.woff2',
    '/webfonts/fa-regular-400.woff2',
    '/webfonts/fa-brands-400.woff2'
    // ...tambahkan semua file dari folder webfonts
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});