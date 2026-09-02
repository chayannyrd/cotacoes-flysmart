interface Props {
  value: string; // "HH:MM" ou vazio
  onChange: (value: string) => void;
}

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

/**
 * Seletor de horário próprio: dois <select> (hora e minuto), garantindo
 * minutos sempre de 5 em 5 em qualquer navegador. O <input type="time">
 * nativo ignora o "step" em vários navegadores (ex: Chrome no Android),
 * então esse componente troca por dropdowns controlados manualmente.
 */
export default function TimeSelect({ value, onChange }: Props) {
  const [horaAtual, minutoAtual] = value ? value.split(":") : ["", ""];

  const setHora = (h: string) => {
    onChange(`${h}:${minutoAtual || "00"}`);
  };

  const setMinuto = (m: string) => {
    onChange(`${horaAtual || "00"}:${m}`);
  };

  return (
    <div className="flex items-stretch gap-1">
      <select
        className="w-full rounded border border-slate-300 px-1 py-1 text-sm outline-none focus:border-[#0056B3]"
        value={horaAtual}
        onChange={(e) => setHora(e.target.value)}
        aria-label="Hora"
      >
        <option value="" disabled>
          --
        </option>
        {HORAS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="flex items-center text-slate-400">:</span>
      <select
        className="w-full rounded border border-slate-300 px-1 py-1 text-sm outline-none focus:border-[#0056B3]"
        value={minutoAtual}
        onChange={(e) => setMinuto(e.target.value)}
        aria-label="Minuto"
      >
        <option value="" disabled>
          --
        </option>
        {MINUTOS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
