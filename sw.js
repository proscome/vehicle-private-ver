const CACHE = "vehicle-info-v2";


const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./vehicle.json",
  "./icons/icon-192.png",
  "./icons/proscome-icon.png"
];


/* ==========================================
   インストール
   ========================================== */

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches
      .open(CACHE)

      .then((cache) => {

        return cache.addAll(ASSETS);

      })

      .then(() => {

        return self.skipWaiting();

      })

  );

});


/* ==========================================
   有効化
   古いキャッシュを削除
   ========================================== */

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches
      .keys()

      .then((keys) => {

        return Promise.all(

          keys

            .filter(
              key => key !== CACHE
            )

            .map(
              key => caches.delete(key)
            )

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


/* ==========================================
   ファイル取得
   基本はネットから最新版
   オフラインならキャッシュ
   ========================================== */

self.addEventListener("fetch", (event) => {

  const request =
    event.request;


  /*
    GET以外は対象外
  */

  if (
    request.method !== "GET"
  ) {

    return;

  }


  event.respondWith(

    fetch(request)

      .then((response) => {

        /*
          正常なレスポンスなら
          キャッシュも更新
        */

        if (
          response &&
          response.ok
        ) {

          const copy =
            response.clone();


          caches
            .open(CACHE)
            .then((cache) => {

              cache.put(
                request,
                copy
              );

            });

        }


        return response;

      })


      .catch(() => {

        /*
          オフラインの場合は
          キャッシュを使用
        */

        return caches.match(
          request
        );

      })

  );

});