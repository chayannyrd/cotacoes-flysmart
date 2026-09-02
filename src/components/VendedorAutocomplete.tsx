"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { VENDEDORES, Vendedor } from "@/data/vendedores";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (vendedor: Vendedor) => void;
  placeholder?: string;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function VendedorAutocomplete({ value, onChange, onSelect, placeholder }: Props) {
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sugestoes = useMemo(() => {
    const q = normalizar(value.trim());
    const lista = q ? VENDEDORES.filter((v) => normalizar(v.nome).includes(q)) : VENDEDORES;
    return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [value]);

  useEffect(() => {
    setIndiceAtivo(0);
  }, [value]);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const selecionar = (v: Vendedor) => {
    onSelect(v);
    setAberto(false);
  };

  const mostrarLista = aberto && sugestoes.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#0056B3]"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => {
          if (!mostrarLista) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndiceAtivo((i) => Math.min(i + 1, sugestoes.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndiceAtivo((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            selecionar(sugestoes[indiceAtivo]);
          } else if (e.key === "Escape") {
            setAberto(false);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
      />

      {mostrarLista && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full min-w-[220px] overflow-y-auto rounded border border-slate-200 bg-white text-sm shadow-lg">
          {sugestoes.map((v, i) => (
            <li key={v.nome}>
              <button
                type="button"
                className={`flex w-full flex-col items-start gap-0 px-3 py-1.5 text-left hover:bg-slate-50 ${
                  i === indiceAtivo ? "bg-slate-100" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(v)}
              >
                <span className="font-medium text-slate-700">{v.nome}</span>
                <span className="text-xs text-slate-400">{v.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
