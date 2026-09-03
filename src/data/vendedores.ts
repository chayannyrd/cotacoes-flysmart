export interface Vendedor {
  nome: string;
  email: string;
  telefone: string;
}

// Cadastro de vendedores. Pra adicionar alguém novo, é só incluir um item
// aqui — a sugestão e o preenchimento automático de e-mail/telefone
// aparecem sozinhos no campo "Consultor".
export const VENDEDORES: Vendedor[] = [
  {
    nome: "Erika Ogata",
    email: "erikaflysmart@gmail.com",
    telefone: "+55 11 93276-2660",
  },
  {
    nome: "Gabriel Santos",
    email: "gabrielflysmart@gmail.com",
    telefone: "+55 11 94058-4367",
  },
  {
    nome: "Laís Ogata",
    email: "laisnaomi2024@gmail.com",
    telefone: "+55 11 99759-0979",
  },
  {
    nome: "Viviane Varelo",
    email: "vivivarelo@gmail.com",
    telefone: "+55 11 98643-5554",
  },
  {
    nome: "Cátia Silva",
    email: "katrina281309@gmail.com",
    telefone: "+55 85 9633-4912",
  },
  {
    nome: "Kelly Viana",
    email: "kellyyviana93@gmail.com",
    telefone: "+55 13 93618-1714",
  },
  {
    nome: "Gisele Queiroz",
    email: "giseleflysmart@gmail.com",
    telefone: "+55 71 93618-1541"
  },
  {
    nome: "Amanda Maciel",
    email: "amanda.tanabepromotora@gmail.com",
    telefone: "+55 11 98424-4569"
  },
  {
    nome: "Henrique Vincler",
    email: "vinclerhenriquetbr@gmail.com",
    telefone: "+55 11 97863-7719"
  }
];
