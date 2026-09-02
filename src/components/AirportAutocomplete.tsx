"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import airports from "@/data/airports.json";

interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const LISTA: Airport[] = airports as Airport[];
const MAX_SUGESTOES = 8;

function buscarAeroportos(consulta: string): Airport[] {
  const q = normalizar(consulta.trim());
  if (!q) return [];

  const qUpper = consulta.trim().toUpperCase();
  const resultados: { aeroporto: Airport; prioridade: number }[] = [];

  for (const aeroporto of LISTA) {
    const cidade = normalizar(aeroporto.city);
    const nome = normalizar(aeroporto.name);
    const pais = normalizar(aeroporto.country);

    let prioridade = -1;
    if (aeroporto.iata === qUpper) prioridade = 0;
    else if (cidade.startsWith(q)) prioridade = 1;
    else if (aeroporto.iata.startsWith(qUpper) && qUpper.length <= 3) prioridade = 2;
    else if (nome.startsWith(q)) prioridade = 3;
    else if (cidade.includes(q)) prioridade = 4;
    else if (nome.includes(q)) prioridade = 5;
    else if (pais.includes(q)) prioridade = 6;

    if (prioridade >= 0) {
      resultados.push({ aeroporto, prioridade });
    }
    if (resultados.length > 400) break; // corta cedo em buscas muito genéricas
  }

  resultados.sort((a, b) => a.prioridade - b.prioridade || a.aeroporto.city.localeCompare(b.aeroporto.city));
  return resultados.slice(0, MAX_SUGESTOES).map((r) => r.aeroporto);
}

export default function AirportAutocomplete({ value, onChange, placeholder }: Props) {
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const sugestoes = useMemo(() => buscarAeroportos(value), [value]);

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

  const selecionar = (a: Airport) => {
    onChange(`${a.iata} - ${a.city}`);
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
        <ul className="absolute z-20 mt-1 max-h-64 w-full min-w-[260px] overflow-y-auto rounded border border-slate-200 bg-white text-sm shadow-lg">
          {sugestoes.map((a, i) => (
            <li key={a.iata}>
              <button
                type="button"
                className={`flex w-full flex-col items-start gap-0 px-3 py-1.5 text-left hover:bg-slate-50 ${
                  i === indiceAtivo ? "bg-slate-100" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(a)}
              >
                <span className="text-slate-700">
                  <span className="font-semibold text-[#0056B3]">{a.iata}</span> - {a.city}
                  {a.country ? `, ${a.country}` : ""}
                </span>
                <span className="text-xs text-slate-400">{a.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
