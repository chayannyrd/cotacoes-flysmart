"use client";

import { useId } from "react";

interface Props {
  value: string; // "HH:MM" (ou "HHhMM" se separador="h"), ou vazio
  onChange: (value: string) => void;
  separador?: string; // ":" pra horário (padrão), "h" pra duração/tempo de espera
}

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

/**
 * Seletor de horário/duração: dois campos (hora e minuto) que aceitam
 * tanto clicar numa opção da lista quanto digitar livremente. Usa
 * <input list="..."> + <datalist> em vez de <select>, porque o <select>
 * nativo só permite escolher, não digitar. Cada minuto sugerido é de 5
 * em 5, mas como é um input de texto, nada impede o vendedor de digitar
 * outro valor (ex: 07 minutos) se precisar.
 *
 * O separador é configurável pra esse mesmo componente servir tanto pra
 * horário de partida/chegada ("14:30") quanto pra duração/tempo de
 * espera ("01h20"), que segue a mesma convenção usada no campo Duração.
 */
export default function TimeSelect({ value, onChange, separador = ":" }: Props) {
  const idHoras = useId();
  const idMinutos = useId();

  const partes = value ? value.split(separador) : [];
  const horaAtual = partes[0] ?? "";
  const minutoAtual = partes[1] ?? "";

  const soDigitos = (v: string) => v.replace(/\D/g, "").slice(0, 2);

  const setHora = (h: string) => onChange(`${soDigitos(h)}${separador}${minutoAtual}`);
  const setMinuto = (m: string) => onChange(`${horaAtual}${separador}${soDigitos(m)}`);

  // Ao sair do campo, completa com zero à esquerda (ex: "1" -> "01"),
  // já que enquanto digita precisa aceitar 1 dígito só.
  const onBlurHora = () => {
    if (horaAtual) onChange(`${horaAtual.padStart(2, "0")}${separador}${minutoAtual}`);
  };
  const onBlurMinuto = () => {
    if (minutoAtual) onChange(`${horaAtual}${separador}${minutoAtual.padStart(2, "0")}`);
  };

  return (
    <div className="flex items-stretch gap-1">
      <input
        list={idHoras}
        className="w-full min-w-0 rounded border border-slate-300 px-1 py-1 text-sm outline-none focus:border-[#0056B3]"
        value={horaAtual}
        onChange={(e) => setHora(e.target.value)}
        onBlur={onBlurHora}
        placeholder="--"
        inputMode="numeric"
        maxLength={2}
        aria-label="Hora"
      />
      <datalist id={idHoras}>
        {HORAS.map((h) => (
          <option key={h} value={h} />
        ))}
      </datalist>

      <span className="flex items-center text-slate-400">{separador}</span>

      <input
        list={idMinutos}
        className="w-full min-w-0 rounded border border-slate-300 px-1 py-1 text-sm outline-none focus:border-[#0056B3]"
        value={minutoAtual}
        onChange={(e) => setMinuto(e.target.value)}
        onBlur={onBlurMinuto}
        placeholder="--"
        inputMode="numeric"
        maxLength={2}
        aria-label="Minuto"
      />
      <datalist id={idMinutos}>
        {MINUTOS.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>
    </div>
  );
}
