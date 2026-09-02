# Gerador de Cotações — Flysmart

Sistema interno pra gerar cotações de voo em PDF, com a identidade visual da Flysmart.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`.

## Como funciona

- **Tela dividida**: formulário à esquerda, preview do documento em tempo real à direita.
- **Toggle no topo**: alterna entre modo **"Ida e Volta (RT)"** (2 trechos fixos, ida e volta,
  com resumo de total combinado) e **"Trechos Avulsos"** (N trechos independentes, sem
  vínculo tarifário entre eles, sem total combinado).
- Cada trecho tem uma lista de **opções de voo** (companhia, número, horário, equipamento,
  duração, preço). A duração é sugerida automaticamente a partir do horário de
  partida/chegada, mas pode ser editada manualmente a qualquer momento.
- O botão **"Exportar PDF"** abre o diálogo de impressão do navegador (`window.print()`),
  já configurado pra sair em A4 mostrando só o documento (a interface do formulário fica
  oculta na impressão). Na caixa de diálogo, é só escolher "Salvar como PDF".

## Estrutura do projeto

```
src/
  app/
    page.tsx        → tela principal (form + preview + lógica de estado)
    layout.tsx       → layout raiz
    globals.css       → estilos globais + regras de impressão
  components/
    ContactForm.tsx    → dados de contato (empresa, consultor, telefone, e-mail)
    TrechoForm.tsx     → bloco de um trecho (origem/destino/data + voos)
    FlightOptionRow.tsx → uma opção de voo dentro de um trecho
    QuotePreview.tsx    → o documento em si (o que vira o PDF)
  types/
    quote.ts         → tipos de dados (ContactInfo, Trecho, FlightOption, etc.)
  lib/
    utils.ts          → cálculo de duração automática, formatação de moeda, geração de ids
public/
  logo-flysmart.png   → logo (fundo branco) usada no cabeçalho do documento
```

## Deploy na Vercel

1. Sobe esse projeto pro GitHub (repositório novo).
2. Na Vercel: **New Project** → importa o repositório → deploy (não precisa configurar
   nada extra, é um projeto Next.js padrão).

## Próxima fase (ainda não implementada nesta v1)

- Extração automática de dados a partir de um print colado (sugestão do Gabriel): o
  vendedor colaria uma captura de tela da busca de voo e o sistema preencheria o
  formulário sozinho via IA com visão, mantendo revisão manual antes de confirmar.
  Isso precisaria de uma rota de API (`/api/extract`) chamando um modelo com suporte a
  imagem, e uma chave de API configurada como variável de ambiente na Vercel.

## Notas de identidade visual

- Azul marinho `#203D5F` — usado só na logo.
- Azul vivo `#0056B3` — títulos de seção, tabela, valores em destaque.
- Cores por companhia aérea: GOL `#FF6600`, LATAM `#7A1E30`, AZUL `#0072CE` (usadas nas
  badges da coluna "Cia" — como não temos os arquivos oficiais dos logos das companhias,
  usamos badge colorido + nome em vez do logo real; se algum dia tiverem os arquivos
  oficiais, dá pra trocar por `<img>` na função `flight-table` do `QuotePreview.tsx`).
