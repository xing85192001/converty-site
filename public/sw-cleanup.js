// Pre-hydration service-worker cleanup. Runs before React hydration so a stale
// worker (e.g. sw-v7.js) cannot claim clients and trigger the "Minified React
// error #418" / insertBefore crash. Unregisters every service-worker
// registration, deletes every cache, then reloads once per session.
(function () {
  try {
    if (!("serviceWorker" in navigator)) return;
    var FLAG = "sw-cleanup-v9";
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      if (!regs || !regs.length) return;
      Promise.all(
        regs.map(function (r) {
          return r.unregister().catch(function () {});
        })
      )
        .then(function () {
          if (window.caches && window.caches.keys) {
            return window.caches.keys().then(function (keys) {
              return Promise.all(
                keys.map(function (key) {
                  return window.caches.delete(key).catch(function () {});
                })
              );
            });
          }
        })
        .then(function () {
          try {
            if (!sessionStorage.getItem(FLAG)) {
              sessionStorage.setItem(FLAG, "1");
              location.reload();
            }
          } catch (e) {
            /* sessionStorage unavailable */
          }
        })
        .catch(function () {});
    });
  } catch (e) {
    /* no-op */
  }
})();
