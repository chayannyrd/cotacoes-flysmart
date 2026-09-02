/**
 * Calcula a duração (HH:MM -> "0Xh0Y") a partir do horário de partida e chegada.
 * Assume voo no mesmo dia; se a chegada for "menor" que a partida, assume que
 * cruzou a meia-noite (soma 24h).
 */
export function calcularDuracao(partida: string, chegada: string): string {
  if (!/^\d{2}:\d{2}$/.test(partida) || !/^\d{2}:\d{2}$/.test(chegada)) {
    return "";
  }
  const [ph, pm] = partida.split(":").map(Number);
  const [ch, cm] = chegada.split(":").map(Number);

  let minutosPartida = ph * 60 + pm;
  let minutosChegada = ch * 60 + cm;

  if (minutosChegada < minutosPartida) {
    minutosChegada += 24 * 60;
  }

  const diff = minutosChegada - minutosPartida;
  const horas = Math.floor(diff / 60);
  const minutos = diff % 60;

  return `${String(horas).padStart(2, "0")}h${String(minutos).padStart(2, "0")}`;
}

let counter = 0;
export function novoId(prefixo: string): string {
  counter += 1;
  return `${prefixo}-${Date.now()}-${counter}`;
}

export function formatarMoeda(valor: string): string {
  const num = parseFloat(valor.replace(/\./g, "").replace(",", "."));
  if (isNaN(num)) return valor;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Máscara de moeda pra campo de input: recebe o valor digitado (o usuário
 * só digita números) e devolve já formatado como "852,93", tratando os
 * últimos 2 dígitos como centavos. Usado no campo de preço do voo pra
 * formatar em tempo real enquanto o vendedor digita.
 */
export function mascaraMoedaInput(valorDigitado: string): string {
  const digitos = valorDigitado.replace(/\D/g, "");
  if (!digitos) return "";
  const num = parseInt(digitos, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Máscara de data pra campo de input: recebe o valor digitado (só números)
 * e devolve formatado como DD/MM/AAAA, inserindo as barras conforme o
 * vendedor digita.
 */
export function mascaraDataInput(valorDigitado: string): string {
  const digitos = valorDigitado.replace(/\D/g, "").slice(0, 8);
  const dd = digitos.slice(0, 2);
  const mm = digitos.slice(2, 4);
  const aaaa = digitos.slice(4, 8);

  let resultado = dd;
  if (digitos.length > 2) resultado += `/${mm}`;
  if (digitos.length > 4) resultado += `/${aaaa}`;
  return resultado;
}

/**
 * Formata a quantidade de bagagem despachada pro padrão exibido na
 * cotação, ex: 0 -> "00 bagagens", 1 -> "01 bagagem", 2 -> "02 bagagens".
 */
export function formatarBagagem(qtd: number): string {
  const n = Number.isFinite(qtd) ? Math.max(0, Math.floor(qtd)) : 0;
  const rotulo = n === 1 ? "bagagem" : "bagagens";
  return `${String(n).padStart(2, "0")} ${rotulo}`;
}

/**
 * Converte data "DD/MM/AAAA" (do campo com máscara) pro formato ISO
 * "AAAA-MM-DD" que o <input type="date"> nativo espera. Retorna "" se a
 * data ainda estiver incompleta ou inválida, pra não quebrar o picker.
 */
export function dataParaISO(data: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  if (!match) return "";
  const [, dd, mm, aaaa] = match;
  return `${aaaa}-${mm}-${dd}`;
}

/**
 * Converte data ISO "AAAA-MM-DD" (vinda do <input type="date"> nativo) pro
 * formato "DD/MM/AAAA" usado no campo com máscara.
 */
export function isoParaData(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const [, aaaa, mm, dd] = match;
  return `${dd}/${mm}/${aaaa}`;
}

/**
 * Gera um sufixo aleatório (letras e números) pra usar no nome do arquivo
 * de PDF exportado, ex: "a3F9kQ2x".
 */
export function gerarSufixoAleatorio(tamanho = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let resultado = "";
  for (let i = 0; i < tamanho; i++) {
    resultado += chars[Math.floor(Math.random() * chars.length)];
  }
  return resultado;
}
