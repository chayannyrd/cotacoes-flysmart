import { Trecho, FlightOption, FAMILIAS_TARIFARIAS, ESCALAS } from "@/types/quote";
import { novoId, mascaraDataInput, dataParaISO, isoParaData } from "@/lib/utils";
import FlightOptionRow from "./FlightOptionRow";
import AirportAutocomplete from "./AirportAutocomplete";
import { useRef } from "react";

interface Props {
  trecho: Trecho;
  label: string;
  onChange: (trecho: Trecho) => void;
  onRemove?: () => void;
}

function novoVoo(): FlightOption {
  const companhia = "GOL";
  return {
    id: novoId("voo"),
    companhia,
    familiaTarifaria: FAMILIAS_TARIFARIAS[companhia][0],
    partida: "",
    chegada: "",
    duracao: "",
    duracaoManual: false,
    escala: ESCALAS[0],
    bagagemIncluida: true,
    preco: "",
  };
}

export default function TrechoForm({ trecho, label, onChange, onRemove }: Props) {
  const dataRef = useRef<HTMLInputElement>(null);

  const set = (field: "origem" | "destino" | "data", value: string) => {
    onChange({ ...trecho, [field]: value });
  };

  const addVoo = () => {
    onChange({ ...trecho, voos: [...trecho.voos, novoVoo()] });
  };

  const updateVoo = (voo: FlightOption) => {
    onChange({
      ...trecho,
      voos: trecho.voos.map((v) => (v.id === voo.id ? voo : v)),
    });
  };

  const removeVoo = (id: string) => {
    onChange({ ...trecho, voos: trecho.voos.filter((v) => v.id !== id) });
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </h2>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Remover trecho
          </button>
        )}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500">Origem</span>
          <AirportAutocomplete
            value={trecho.origem}
            onChange={(v) => set("origem", v)}
            placeholder="Ex: CGH - São Paulo"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500">Destino</span>
          <AirportAutocomplete
            value={trecho.destino}
            onChange={(v) => set("destino", v)}
            placeholder="Ex: SDU - Rio de Janeiro"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500">Data</span>
          <div className="flex items-stretch rounded border border-slate-300 focus-within:border-[#0056B3]">
            <input
              className="w-full rounded-l px-2 py-1.5 text-sm outline-none"
              value={trecho.data}
              onChange={(e) => set("data", mascaraDataInput(e.target.value))}
              placeholder="09/10/2026"
              inputMode="numeric"
            />
            <button
              type="button"
              className="flex items-center rounded-r border-l border-slate-300 bg-slate-50 px-2 text-slate-500 hover:bg-slate-100"
              title="Escolher data no calendário"
              onClick={() => {
                const el = dataRef.current;
                if (!el) return;
                if (typeof el.showPicker === "function") {
                  el.showPicker();
                } else {
                  el.focus();
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </button>
            <input
              ref={dataRef}
              type="date"
              className="pointer-events-none h-0 w-0 opacity-0"
              tabIndex={-1}
              value={dataParaISO(trecho.data)}
              onChange={(e) => set("data", isoParaData(e.target.value))}
            />
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {trecho.voos.map((voo) => (
          <FlightOptionRow
            key={voo.id}
            voo={voo}
            onChange={updateVoo}
            onRemove={() => removeVoo(voo.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addVoo}
        className="mt-3 rounded border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-[#0056B3] hover:bg-slate-50"
      >
        + Adicionar opção de voo
      </button>
    </div>
  );
}
