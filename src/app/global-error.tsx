'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  const isProd = process.env.NODE_ENV === 'production';

  // İstersen prod’da hatayı sessizce loglayabilirsin (ör. /api/error-log).
  useEffect(() => {
    if (isProd) {
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: (error as any)?.message ?? String(error),
          stack: (error as any)?.stack ?? null,
          path: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      }).catch(() => {});
    }
  }, [error, isProd]);

  return (
    <html>
      <body className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center space-y-4 max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-red-600">Bir şeyler yanlış gitti</h2>

          {/* Prod: teknik detay yok – kullanıcıya sade mesaj */}
          {isProd ? (
            <p className="text-gray-700">
              Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </p>
          ) : (
            <>
              <p className="text-gray-700">
                Geliştirme modundasın — hata ayrıntıları aşağıda:
              </p>
              <div className="text-left bg-white border border-red-200 rounded-lg p-4 overflow-auto max-h-64">
                <p className="font-mono text-sm text-red-800 break-words">
                  {(error as any)?.message
                    ? String((error as any).message)
                    : String(error)}
                </p>
                {(error as any)?.stack && (
                  <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
                    {String((error as any).stack)}
                  </pre>
                )}
              </div>
            </>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Tekrar dene
            </button>

            {/* Dev’de ekstra: sayfayı tamamen yenile butonu */}
            {!isProd && (
              <button
                onClick={() => location.reload()}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Yenile
              </button>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
