"use client";

import { useRef, useState } from "react";
import { QuoteData, QuoteMode, Trecho, ContactInfo } from "@/types/quote";
import { novoId, gerarSufixoAleatorio } from "@/lib/utils";
import ContactForm from "@/components/ContactForm";
import TrechoForm from "@/components/TrechoForm";
import QuotePreview from "@/components/QuotePreview";
import PreviewPane from "@/components/PreviewPane";

function novoTrecho(): Trecho {
  return {
    id: novoId("trecho"),
    origem: "",
    destino: "",
    data: "",
    voos: [],
  };
}

const CONTATO_VAZIO: ContactInfo = {
  empresa: "Flysmart Passagens LTDA",
  consultor: "",
  telefone: "",
  email: "",
};

export default function Home() {
  const [mode, setMode] = useState<QuoteMode>("rt");
  const [contato, setContato] = useState<ContactInfo>(CONTATO_VAZIO);
  const [trechos, setTrechos] = useState<Trecho[]>([novoTrecho(), novoTrecho()]);
  const [exportando, setExportando] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const data: QuoteData = { mode, contato, trechos };

  const trocarModo = (novoModo: QuoteMode) => {
    setMode(novoModo);
    if (novoModo === "rt") {
      setTrechos((prev) => {
        const base = prev.slice(0, 2);
        while (base.length < 2) base.push(novoTrecho());
        return base;
      });
    }
  };

  const updateTrecho = (t: Trecho) => {
    setTrechos((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  };

  const addTrecho = () => {
    setTrechos((prev) => [...prev, novoTrecho()]);
  };

  const removeTrecho = (id: string) => {
    setTrechos((prev) => prev.filter((t) => t.id !== id));
  };

  const imprimir = async () => {
    if (!printRef.current || exportando) return;
    setExportando(true);

    const wrapper = printRef.current;
    // O elemento capturado tem a classe .print-only, que fica com
    // display:none fora do modo de impressão do navegador (só some pra
    // "block" dentro de @media print). Como aqui geramos o PDF via
    // html2canvas diretamente — sem passar pelo print do navegador — o
    // elemento fica escondido na hora da captura, o canvas sai com 0x0 e
    // isso quebra o jsPDF.addImage mais na frente. Por isso forçamos ele a
    // ficar visível só durante a captura, e desfazemos isso depois.
    const displayOriginal = wrapper.style.display;
    wrapper.style.display = "block";

    // IMPORTANTE: não capturamos o `wrapper` (.print-only) em si — ele não
    // tem largura própria, então quando vira display:block ele ocupa 100%
    // da largura da página (bem mais que os 210mm da folha). O html2canvas
    // então captura esse retângulo enorme, com a folha real (#quote-preview,
    // que tem width:210mm fixo e fica centralizada com mx-auto) ocupando só
    // uma fração pequena no meio, cercada de espaço em branco. O resultado é
    // esse espaço em branco todo sendo esticado pra caber na página do PDF,
    // e o conteúdo real encolhendo junto. Por isso capturamos a folha em si.
    const el = wrapper.querySelector<HTMLElement>("#quote-preview") ?? wrapper;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("Canvas de captura veio vazio (0x0).");
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      // JPEG em vez de PNG: o decodificador de PNG do jsPDF vem dando o erro
      // "wrong PNG signature" com a imagem gerada pelo html2canvas em
      // algumas versões. JPEG evita esse parser e funciona de forma estável
      // (não precisamos de transparência aqui, o fundo já é branco).
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      let alturaRestante = imgHeight;
      let posicaoY = 0;

      pdf.addImage(imgData, "JPEG", 0, posicaoY, imgWidth, imgHeight);
      alturaRestante -= pageHeight;

      while (alturaRestante > 0) {
        posicaoY = alturaRestante - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, posicaoY, imgWidth, imgHeight);
        alturaRestante -= pageHeight;
      }

      pdf.save(`bilhete_flysmart_${gerarSufixoAleatorio()}.pdf`);
    } catch (erro) {
      console.error("Falha ao gerar o PDF:", erro);
      alert("Não foi possível gerar o PDF. Tente novamente — se persistir, avise o suporte.");
    } finally {
      wrapper.style.display = displayOriginal;
      setExportando(false);
    }
  };

  const labelTrecho = (idx: number) => {
    if (mode === "rt") return idx === 0 ? "Trecho de ida" : "Trecho de volta";
    return `Trecho ${idx + 1}`;
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Topbar */}
      <header className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo-flysmart-azulescuro.png"
            alt="Flysmart"
            className="h-8 w-8 object-contain"
          />
          <div>
            <h1 className="text-base font-semibold text-[#203D5F]">Software - Gerador de Cotações</h1>
            <p className="text-xs text-slate-500">Flysmart Passagens</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-md border border-slate-300 p-0.5 text-sm">
            <button
              onClick={() => trocarModo("rt")}
              className={`rounded px-3 py-1.5 font-medium transition ${
                mode === "rt" ? "bg-[#0056B3] text-white" : "text-slate-600"
              }`}
            >
              Ida e Volta (RT)
            </button>
            <button
              onClick={() => trocarModo("avulso")}
              className={`rounded px-3 py-1.5 font-medium transition ${
                mode === "avulso" ? "bg-[#0056B3] text-white" : "text-slate-600"
              }`}
            >
              Trechos Avulsos
            </button>
          </div>

          <button
            onClick={imprimir}
            disabled={exportando}
            className="rounded-md bg-[#203D5F] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {exportando ? "Gerando PDF..." : "Exportar PDF"}
          </button>
        </div>
      </header>

      {/* Split screen */}
      <div className="no-print flex items-start gap-6 p-6">
        {/* Formulário — 60% do espaço disponível */}
        <div className="flex flex-[3] min-w-0 flex-col gap-4">
          <ContactForm contato={contato} onChange={setContato} />

          {trechos.map((trecho, idx) => (
            <TrechoForm
              key={trecho.id}
              trecho={trecho}
              label={labelTrecho(idx)}
              onChange={updateTrecho}
              onRemove={
                mode === "avulso" && trechos.length > 1
                  ? () => removeTrecho(trecho.id)
                  : undefined
              }
            />
          ))}

          {mode === "avulso" && (
            <button
              onClick={addTrecho}
              className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#0056B3] hover:bg-slate-50"
            >
              + Adicionar trecho
            </button>
          )}
        </div>

        {/* Preview — 40% do espaço disponível. Fixo na tela enquanto rola
            o formulário, escala automaticamente pra caber inteiro sem
            precisar rolar */}
        <div className="sticky top-[76px] h-[calc(100vh-96px)] flex-[2] min-w-0 rounded-md bg-slate-100 p-4">
          <PreviewPane>
            <QuotePreview data={data} />
          </PreviewPane>
        </div>
      </div>

      {/* Área exclusiva pro PDF: sempre renderizada, mas fora da tela
          (veja .print-only em globals.css) — é o que o html2canvas captura */}
      <div ref={printRef} className="print-only">
        <QuotePreview data={data} />
      </div>
    </div>
  );
}
