export type QuoteMode = "rt" | "avulso";

export interface ContactInfo {
  empresa: string;
  consultor: string;
  telefone: string;
  email: string;
}

export interface FlightOption {
  id: string;
  companhia: string;
  familiaTarifaria: string; // depende da companhia, ex: LIGHT, STANDARD, FULL...
  partida: string; // HH:MM
  chegada: string; // HH:MM
  duracao: string; // HH:MM, sugerida automaticamente, editável
  duracaoManual: boolean; // true se o vendedor editou manualmente
  escala: string; // ex: "Direto", "1 parada", "2 paradas"
  bagagemIncluida: boolean; // se a bagagem despachada está incluída nessa tarifa
  preco: string; // ex: "852,93"
}

export interface Trecho {
  id: string;
  origem: string; // ex: "CGH - São Paulo"
  destino: string; // ex: "SDU - Rio de Janeiro"
  data: string; // DD/MM/AAAA
  voos: FlightOption[];
}

// Opções de escala disponíveis no formulário de opção de voo.
export const ESCALAS = ["Direto", "1 parada", "2 paradas"];

// Famílias tarifárias disponíveis por companhia. A opção selecionável no
// formulário de opção de voo depende da companhia escolhida.
export const FAMILIAS_TARIFARIAS: Record<string, string[]> = {
  GOL: ["Light", "Classic", "Flex"],
  LATAM: ["Light", "Standard", "Full"],
  AZUL: ["Light", "+Azul"],
};

export interface QuoteData {
  mode: QuoteMode;
  contato: ContactInfo;
  trechos: Trecho[];
}

export const AIRLINE_COLORS: Record<string, string> = {
  GOL: "#FF6600",
  LATAM: "#7A1E30",
  AZUL: "#0072CE",
};

// Caminho do arquivo de logo de cada companhia, dentro da pasta /public.
// Coloque os arquivos de imagem em /public/logos/ com esses nomes exatos.
// Se o arquivo não existir, a cotação cai automaticamente pro selo colorido
// com o nome da companhia (fallback via onError na tag <img>).
export const AIRLINE_LOGOS: Record<string, string> = {
  GOL: "/logos/gol.png",
  LATAM: "/logos/latam.png",
  AZUL: "/logos/azul.png",
};

export const NAVY = "#203D5F";
export const BLUE = "#0056B3";
