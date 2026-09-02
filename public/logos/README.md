# Logos das companhias aéreas

Coloque aqui os arquivos de logo de cada companhia, com esses nomes exatos:

- gol.png
- latam.png
- azul.png

Recomendado: PNG com fundo transparente, altura de uns 60-80px (a cotação
redimensiona pra 20px de altura automaticamente, mantendo a proporção).

Se algum arquivo não existir ou não carregar, a cotação cai automaticamente
pro selo colorido com o nome da companhia (comportamento atual).

Pra adicionar uma nova companhia: acrescente a sigla em `COMPANHIAS` (em
`src/components/FlightOptionRow.tsx`), em `FAMILIAS_TARIFARIAS`,
`AIRLINE_COLORS` e `AIRLINE_LOGOS` (em `src/types/quote.ts`), e coloque o
arquivo de logo aqui com o nome correspondente em minúsculo.
