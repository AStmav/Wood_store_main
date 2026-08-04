import { useEffect } from 'react';

/**
 * Яндекс.Метрика. ID задаётся через VITE_YANDEX_METRIKA_ID.
 * Без ID скрипт не подключается.
 */
export default function YandexMetrika() {
  const id = (import.meta.env.VITE_YANDEX_METRIKA_ID || '').trim();

  useEffect(() => {
    if (!id || typeof window === 'undefined') return undefined;

    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

    window.ym(Number(id), 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });

    return undefined;
  }, [id]);

  if (!id) return null;

  return (
    <noscript>
      <div>
        <img
          src={`https://mc.yandex.ru/watch/${id}`}
          style={{ position: 'absolute', left: '-9999px' }}
          alt=""
        />
      </div>
    </noscript>
  );
}
