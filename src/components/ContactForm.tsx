import { ContactInfo } from "@/types/quote";
import { Vendedor } from "@/data/vendedores";
import VendedorAutocomplete from "./VendedorAutocomplete";

interface Props {
  contato: ContactInfo;
  onChange: (contato: ContactInfo) => void;
}

export default function ContactForm({ contato, onChange }: Props) {
  const set = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contato, [field]: value });
  };

  const selecionarVendedor = (v: Vendedor) => {
    onChange({ ...contato, consultor: v.nome, telefone: v.telefone, email: v.email });
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Informações para contato
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500">Empresa</span>
          <div
            className="rounded border border-slate-200 bg-slate-100 px-2 py-1.5 text-sm text-slate-600"
            title="Nome fixo, não editável"
          >
            {contato.empresa}
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500">Consultor</span>
          <VendedorAutocomplete
            value={contato.consultor}
            onChange={(v) => set("consultor", v)}
            onSelect={selecionarVendedor}
            placeholder="Seu nome"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500">Telefone</span>
          <input
            className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#0056B3]"
            value={contato.telefone}
            onChange={(e) => set("telefone", e.target.value)}
            placeholder="(00) 0000-0000"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs font-medium text-slate-500">E-mail</span>
          <input
            className="rounded border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-[#0056B3]"
            value={contato.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email@empresa.com"
          />
        </label>
      </div>
    </div>
  );
}
