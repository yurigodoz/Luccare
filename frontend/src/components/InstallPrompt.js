'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'installPromptDismissedAt';
// Não insiste: após dispensar, só volta a aparecer depois de 7 dias.
const DISMISS_DAYS = 7;

function foiDispensadoRecentemente() {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY));
    if (!ts) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function estaInstalado() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function ehIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOSClassico = /iPad|iPhone|iPod/.test(ua);
  // iPadOS recente se identifica como Mac com touch
  const iPadModerno = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return iOSClassico || iPadModerno;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visivel, setVisivel] = useState(false);
  const [modoIOS, setModoIOS] = useState(false);

  useEffect(() => {
    if (estaInstalado() || foiDispensadoRecentemente()) return;

    // Android/Chrome/Edge: o navegador avisa que a instalação é possível.
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setModoIOS(false);
      setVisivel(true);
    };

    const onInstalled = () => {
      setVisivel(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    // iOS/Safari não dispara beforeinstallprompt — mostramos instruções manuais.
    let timer;
    if (ehIOS()) {
      timer = setTimeout(() => {
        setModoIOS(true);
        setVisivel(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dispensar = () => {
    setVisivel(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // localStorage indisponível — apenas esconde nesta sessão.
    }
  };

  const instalar = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisivel(false);
    if (outcome === 'dismissed') {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // ignora
      }
    }
  };

  if (!visivel) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="max-w-[800px] mx-auto bg-white border border-blue-200 rounded-xl shadow-lg p-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192.png"
          alt="Luccare"
          className="w-12 h-12 rounded-lg shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Instalar o Luccare</p>
          {modoIOS ? (
            <p className="text-sm text-gray-600">
              Toque em <span aria-hidden="true">⬆️</span> Compartilhar e depois em
              &quot;Adicionar à Tela de Início&quot;.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Acesse mais rápido, direto da tela inicial do seu dispositivo.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {!modoIOS && (
            <button
              type="button"
              onClick={instalar}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Instalar
            </button>
          )}
          <button
            type="button"
            onClick={dispensar}
            className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-lg"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
