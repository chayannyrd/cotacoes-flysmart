import { FlightOption, FAMILIAS_TARIFARIAS, ESCALAS } from "@/types/quote";
import { calcularDuracao, mascaraMoedaInput } from "@/lib/utils";
import TimeSelect from "./TimeSelect";

interface Props {
  voo: FlightOption;
  onChange: (voo: FlightOption) => void;
  onRemove: () => void;
}

const COMPANHIAS = ["GOL", "LATAM", "AZUL"];

export default function FlightOptionRow({ voo, onChange, onRemove }: Props) {
  const set = (field: keyof FlightOption, value: string) => {
    let next: FlightOption = { ...voo, [field]: value };

    // Trocou de companhia: a família tarifária depende da cia, então
    // reseta pra primeira opção válida da nova companhia.
    if (field === "companhia") {
      const familias = FAMILIAS_TARIFARIAS[value] ?? [];
      next = { ...next, familiaTarifaria: familias[0] ?? "" };
    }

    // Recalcula duração automaticamente se partida/chegada mudou e o campo
    // não foi editado manualmente pelo vendedor.
    if ((field === "partida" || field === "chegada") && !voo.duracaoManual) {
      const partida = field === "partida" ? value : voo.partida;
      const chegada = field === "chegada" ? value : voo.chegada;
      next = { ...next, duracao: calcularDuracao(partida, chegada) };
    }
    if (field === "duracao") {
      next = { ...next, duracaoManual: true };
    }
    onChange(next);
  };

  const setBagagemIncluida = (value: boolean) => {
    onChange({ ...voo, bagagemIncluida: value });
  };

  const familias = FAMILIAS_TARIFARIAS[voo.companhia] ?? [];

  return (
    <div className="flex flex-wrap items-end gap-2 rounded border border-slate-200 bg-slate-50 p-2.5">
      <label className="flex w-24 flex-col gap-0.5 text-xs">
        <span className="text-slate-500">Companhia</span>
        <select
          className="rounded border border-slate-300 px-1.5 py-1 text-sm outline-none focus:border-[#0056B3]"
          value={voo.companhia}
          onChange={(e) => set("companhia", e.target.value)}
        >
          {COMPANHIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex w-24 flex-col gap-0.5 text-xs">
        <span className="text-slate-500">Família tarifária</span>
        <select
          className="rounded border border-slate-300 px-1.5 py-1 text-sm outline-none focus:border-[#0056B3]"
          value={voo.familiaTarifaria}
          onChange={(e) => set("familiaTarifaria", e.target.value)}
        >
          {familias.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      <label className="flex w-36 flex-col gap-0.5 text-xs">
        <span className="text-slate-500">Partida</span>
        <TimeSelect value={voo.partida} onChange={(v) => set("partida", v)} />
      </label>

      <label className="flex w-36 flex-col gap-0.5 text-xs">
        <span className="text-slate-500">Chegada</span>
        <TimeSelect value={voo.chegada} onChange={(v) => set("chegada", v)} />
      </label>

      <label className="flex w-20 flex-col gap-0.5 text-xs">
        <span className="text-slate-500" title="Sugerida automaticamente, pode editar">
          Duração
        </span>
        <input
          className="rounded border border-slate-300 px-1.5 py-1 text-sm outline-none focus:border-[#0056B3]"
          value={voo.duracao}
          onChange={(e) => set("duracao", e.target.value)}
          placeholder="01h00"
        />
      </label>

      <label className="flex w-28 flex-col gap-0.5 text-xs">
        <span className="text-slate-500">Escala</span>
        <select
          className="rounded border border-slate-300 px-1.5 py-1 text-sm outline-none focus:border-[#0056B3]"
          value={voo.escala}
          onChange={(e) => set("escala", e.target.value)}
        >
          {ESCALAS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>

      <label className="flex w-32 flex-col gap-0.5 text-xs">
        <span className="text-slate-500">Bagagem</span>
        <select
          className="rounded border border-slate-300 px-1.5 py-1 text-sm outline-none focus:border-[#0056B3]"
          value={voo.bagagemIncluida ? "sim" : "nao"}
          onChange={(e) => setBagagemIncluida(e.target.value === "sim")}
        >
          <option value="sim">Incluído</option>
          <option value="nao">Não incluído</option>
        </select>
      </label>

      <label className="flex w-28 flex-col gap-0.5 text-xs">
        <span className="text-slate-500">Preço</span>
        <div className="flex items-stretch rounded border border-slate-300 focus-within:border-[#0056B3]">
          <span className="flex items-center rounded-l bg-slate-100 px-1.5 text-sm text-slate-500">
            R$
          </span>
          <input
            className="w-full min-w-0 rounded-r px-1.5 py-1 text-sm outline-none"
            value={voo.preco}
            onChange={(e) => set("preco", mascaraMoedaInput(e.target.value))}
            placeholder="0,00"
            inputMode="numeric"
          />
        </div>
      </label>

      <div className="flex items-center pb-1">
        <button
          type="button"
          onClick={onRemove}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          title="Remover opção de voo"
        >
          Remover
        </button>
      </div>
    </div>
  );
}
