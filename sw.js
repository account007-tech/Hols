const CACHE_NAME = "kachel-app-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

// Install: Dateien in Cache legen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Aktivierung: alte Caches löschen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch: erst Netzwerk, sonst Cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Antwort klonen und in Cache legen
        const respClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, respClone);
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
