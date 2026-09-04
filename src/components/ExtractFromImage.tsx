"use client";

import { useRef, useState, type ChangeEvent, type ClipboardEvent } from "react";
import { Trecho, FlightOption, Parada } from "@/types/quote";
import { novoId, calcularDuracao } from "@/lib/utils";

interface ExtractedParada {
  local: string;
  tempoEspera: string;
}

interface ExtractedVoo {
  companhia: string;
  familiaTarifaria: string;
  partida: string;
  chegada: string;
  escala: string;
  paradas: ExtractedParada[];
  bagagemIncluida: boolean;
  preco: string;
}

interface ExtractedTrecho {
  origem: string;
  destino: string;
  data: string;
  voos: ExtractedVoo[];
}

interface Props {
  onExtraido: (trecho: Trecho) => void;
}

function paraTrecho(ext: ExtractedTrecho): Trecho {
  const voos: FlightOption[] = ext.voos.map((v) => {
    const paradas: Parada[] = (v.paradas ?? []).map((p) => ({
      id: novoId("parada"),
      local: p.local,
      tempoEspera: p.tempoEspera,
    }));

    return {
      id: novoId("voo"),
      companhia: v.companhia,
      familiaTarifaria: v.familiaTarifaria,
      partida: v.partida,
      chegada: v.chegada,
      duracao: calcularDuracao(v.partida, v.chegada),
      duracaoManual: false,
      escala: v.escala,
      paradas,
      bagagemIncluida: v.bagagemIncluida,
      preco: v.preco,
    };
  });

  return {
    id: novoId("trecho"),
    origem: ext.origem,
    destino: ext.destino,
    data: ext.data,
    voos,
  };
}

export default function ExtractFromImage({ onExtraido }: Props) {
  const [aberto, setAberto] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const processarArquivo = (file: File) => {
    setErro(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onPaste = (e: ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (item) {
      const file = item.getAsFile();
      if (file) processarArquivo(file);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  };

  const extrair = async () => {
    if (!preview) return;
    setCarregando(true);
    setErro(null);

    try {
      const [, mediaTypeParte, base64] =
        preview.match(/^data:(.+);base64,(.+)$/) ?? [];
      if (!mediaTypeParte || !base64) {
        throw new Error("Não foi possível ler a imagem colada.");
      }

      const resp = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: mediaTypeParte }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error ?? "Erro ao extrair dados.");
      }

      onExtraido(paraTrecho(data));
      setAberto(false);
      setPreview(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  };

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded border border-dashed border-[#0056B3] px-3 py-1.5 text-sm font-medium text-[#0056B3] hover:bg-blue-50"
      >
        📋 Colar print de busca (preencher com IA)
      </button>
    );
  }

  return (
    <div className="rounded-md border border-[#0056B3] bg-blue-50/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0056B3]">
          Extrair trecho a partir de um print
        </h3>
        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setPreview(null);
            setErro(null);
          }}
          className="text-xs text-slate-500 hover:underline"
        >
          Cancelar
        </button>
      </div>

      {!preview ? (
        <div
          ref={areaRef}
          tabIndex={0}
          onPaste={onPaste}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-28 cursor-pointer items-center justify-center rounded border-2 border-dashed border-slate-300 bg-white text-sm text-slate-500 outline-none focus:border-[#0056B3]"
        >
          Clique aqui e cole (Ctrl+V) o print, ou clique pra enviar um arquivo
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Print colado"
            className="max-h-64 rounded border border-slate-200 object-contain"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={extrair}
              disabled={carregando}
              className="rounded bg-[#0056B3] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#004494] disabled:opacity-60"
            >
              {carregando ? "Extraindo..." : "Extrair dados com IA"}
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              disabled={carregando}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Trocar imagem
            </button>
          </div>
        </div>
      )}

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
      <p className="mt-2 text-xs text-slate-400">
        Confira sempre os dados extraídos antes de gerar o PDF — a IA pode errar,
        principalmente em prints de baixa qualidade.
      </p>
    </div>
  );
}
