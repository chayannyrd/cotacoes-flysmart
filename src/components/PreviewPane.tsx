"use client";

import { useCallback, useEffect, useRef, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

/**
 * Exibe o conteúdo (a página A4 do preview) com zoom controlável pelo
 * usuário: botões de + / - e um "Ajustar à tela" que volta a encaixar
 * a página inteira no painel disponível (como no carregamento inicial).
 *
 * Enquanto o modo "ajustar à tela" está ativo, o zoom recalcula sozinho
 * quando o painel muda de tamanho (resize da janela) ou quando o
 * conteúdo muda de tamanho (ex: adicionou mais voos e a página ficou
 * mais alta). Assim que o usuário mexe manualmente no zoom, esse
 * recálculo automático para até ele clicar em "Ajustar à tela" de novo.
 */
export default function PreviewPane({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const autoFitRef = useRef(true);

  const calcularFit = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return null;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;
    if (!contentW || !contentH || !containerW || !containerH) return null;

    const proporcao = Math.min(containerW / contentW, containerH / contentH);
    return Math.min(proporcao, 1);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const recalc = () => {
      if (!autoFitRef.current) return;
      const fit = calcularFit();
      if (fit != null) setScale(fit);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    ro.observe(content);
    return () => ro.disconnect();
  }, [calcularFit]);

  const diminuirZoom = () => {
    autoFitRef.current = false;
    setScale((atual) => Math.max(ZOOM_MIN, +(atual - ZOOM_STEP).toFixed(2)));
  };

  const aumentarZoom = () => {
    autoFitRef.current = false;
    setScale((atual) => Math.min(ZOOM_MAX, +(atual + ZOOM_STEP).toFixed(2)));
  };

  const ajustarATela = () => {
    autoFitRef.current = true;
    const fit = calcularFit();
    if (fit != null) setScale(fit);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Área do preview, com scroll caso o zoom manual ultrapasse o painel */}
      <div
        ref={containerRef}
        className="flex min-h-0 w-full flex-1 items-start justify-center overflow-auto"
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <div ref={contentRef}>{children}</div>
        </div>
      </div>

      {/* Controle de zoom */}
      <div className="no-print mt-3 flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <button
          type="button"
          onClick={diminuirZoom}
          disabled={scale <= ZOOM_MIN}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-base leading-none text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Diminuir zoom"
        >
          −
        </button>

        <span className="w-12 text-center text-sm font-medium text-slate-600 tabular-nums">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={aumentarZoom}
          disabled={scale >= ZOOM_MAX}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-base leading-none text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          aria-label="Aumentar zoom"
        >
          +
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <button
          type="button"
          onClick={ajustarATela}
          className="rounded px-2.5 py-1 text-sm font-medium text-[#0056B3] hover:bg-slate-50"
        >
          Ajustar à tela
        </button>
      </div>
    </div>
  );
}