// 오프라인용 서비스 워커. 온라인이면 항상 최신 파일을 받고, 오프라인이면 저장본을 쓴다.
var CACHE = 'jobdash-v1';

self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then(function (res) {
        if (res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); }
        return res;
      })
      .catch(function () {
        return caches.match(r).then(function (m) { return m || caches.match(r, { ignoreSearch: true }); });
      })
  );
});
