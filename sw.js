// This is a very basic service worker.
// Its primary purpose in this context is to make the app installable (PWA).
// A more advanced service worker would handle offline caching strategies.

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // The service worker is installed.
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // The service worker is activated.
});

self.addEventListener('fetch', (event) => {
  // This event listener is required for the 'beforeinstallprompt' event to fire.
  // We are not implementing a caching strategy here, just letting the request go to the network.
  // console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(fetch(event.request));
});
