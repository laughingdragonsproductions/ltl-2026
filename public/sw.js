/* Festival weekend service worker — cache map + shell assets, save bandwidth on repeat visits. */
const CACHE = "ltl26-fest-v2";

const PRECACHE = [
  "/maps/LTL26_FestMap_1920x1080.jpg",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/sounds/set-alert.wav",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    void cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        void caches.open(CACHE).then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      void caches.open(CACHE).then((c) => c.put(request, response.clone()));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error("offline");
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (
    url.pathname.startsWith("/maps/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/sounds/")
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (url.pathname.startsWith("/games/") || url.pathname.startsWith("/videos/")) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data && event.notification.data.url;
  const path = typeof raw === "string" && raw.startsWith("/") ? raw : "/schedule";
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus().then((focused) => {
            if (focused && "navigate" in focused && typeof focused.navigate === "function") {
              return focused.navigate(target);
            }
            return focused;
          });
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
