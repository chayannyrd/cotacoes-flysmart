import type { CSSProperties } from "react";
import { QuoteData, AIRLINE_COLORS, AIRLINE_LOGOS, NAVY, BLUE } from "@/types/quote";
import { formatarMoeda } from "@/lib/utils";

interface Props {
  data: QuoteData;
}

function hoje(): string {
  const d = new Date();
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Selo da companhia: tenta mostrar a logo (/public/logos/...); se o arquivo
// não existir ou falhar ao carregar, cai pro selo colorido com o nome.
function SeloCompanhia({ companhia }: { companhia: string }) {
  const logo = AIRLINE_LOGOS[companhia];
  const corFallback = AIRLINE_COLORS[companhia] || NAVY;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72 }}>
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={companhia}
          style={{ width: 72, height: 24, objectFit: "contain", objectPosition: "center" }}
          onError={(e) => {
            const img = e.currentTarget;
            img.style.display = "none";
            const fallback = img.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "inline-block";
          }}
        />
      )}
      <span
        style={{
          display: logo ? "none" : "inline-block",
          fontWeight: 700,
          fontSize: "8pt",
          padding: "3px 8px",
          borderRadius: 3,
          color: "#fff",
          background: corFallback,
        }}
      >
        {companhia}
      </span>
    </span>
  );
}

export default function QuotePreview({ data }: Props) {
  const { contato, trechos, mode } = data;


  const totaisPorTrecho = trechos.map((t) => {
    const precos = t.voos
      .map((v) => parseFloat(v.preco.replace(/\./g, "").replace(",", ".")))
      .filter((n) => !isNaN(n));
    const menor = precos.length ? Math.min(...precos) : 0;
    return { trechoId: t.id, menor };
  });

  const totalCombinado = totaisPorTrecho.reduce((acc, t) => acc + t.menor, 0);

  return (
    <div
      id="quote-preview"
      className="mx-auto bg-white text-[#222]"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: "9.5pt",
        padding: "14mm 12mm",
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between pb-3.5"
        style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-flysmart.png" alt="Flysmart" style={{ height: 50 }} />
        <div className="text-right">
          <div style={{ fontSize: "15pt", fontWeight: 700, color: BLUE, marginBottom: 3 }}>
            {mode === "rt" ? "COTAÇÃO DE VIAGEM" : "COTAÇÃO DE PASSAGEM"}
          </div>
          <div style={{ fontSize: "8.5pt", color: "#6b7280" }}>Data: {hoje()}</div>
        </div>
      </div>

      {/* Contato */}
      <div
        className="flex justify-between pb-3.5"
        style={{
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 20,
          fontSize: "9pt",
          lineHeight: 1.7,
        }}
      >
        <div>
          <div>
            <b>Empresa:</b> {contato.empresa || "—"}
          </div>
          <div>
            <b>Consultor:</b> {contato.consultor || "—"}
          </div>
          <div>
            <b>Telefone:</b> {contato.telefone || "—"}
          </div>
          <div>
            <b>E-mail:</b> {contato.email || "—"}
          </div>
        </div>
        <div className="text-right" style={{ color: "#444" }}>
          Flysmart Passagens LTDA
          <br />
          51.709.256/0001-03
        </div>
      </div>

      {/* Aviso legal */}
      <div style={{ fontSize: "7.8pt", color: "#8a8f98", lineHeight: 1.5, marginBottom: 20 }}>
        Tarifas sujeitas a disponibilidade e alteração sem prévio aviso. Somente a emissão do
        bilhete garante a tarifa.
        <br />
        {mode === "rt"
          ? "Tarifa RT (Ida e Volta) só é garantida após a reserva tarifada e combinada para toda a viagem com a mesma companhia."
          : "Cada trecho abaixo é cotado e emitido de forma independente, sujeito à disponibilidade individual de cada tarifa."}
      </div>

      {/* Trechos */}
      {trechos.map((trecho, idx) => {
        return (
          <div key={trecho.id}>
            <div
              style={{
                fontSize: "11pt",
                fontWeight: 700,
                color: BLUE,
                paddingBottom: 6,
                borderBottom: `2px solid ${BLUE}`,
                marginBottom: 4,
                marginTop: idx === 0 ? 0 : 20,
              }}
            >
              Trecho: {trecho.origem || "?"} → {trecho.destino || "?"}{" "}
              <span style={{ fontSize: "8.5pt", color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>
                {trecho.data}
              </span>
            </div>
            {(() => {
              const COL_PCT = [11.6, 13.0, 21.7, 11.6, 13.0, 13.0, 15.9]; // Cia, Tarifa, Partida→Chegada, Duração, Escala, Bagagem, Total
              const cellStyle = (i: number): CSSProperties => ({
                width: `${COL_PCT[i]}%`,
                boxSizing: "border-box",
                padding: "7px 10px",
                textAlign: "center",
              });
              return (
                <div
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  {/* Linhas em Flexbox puro (sem CSS Grid): o html2canvas tem
                      suporte só parcial a layouts modernos — Grid combinado
                      com Flex aninhado fazia a altura da célula ser
                      calculada errado na captura, jogando o texto pro fundo
                      da célula em vez de centralizar. Com uma única camada
                      de Flexbox (a linha inteira, "align-items: center"),
                      o comportamento fica igual na tela e no PDF. */}
                  <div style={{ display: "flex", alignItems: "center", background: BLUE, color: "#fff" }}>
                    {["Cia", "Tarifa", "Partida → Chegada", "Duração", "Escala", "Bagagem", "Total"].map((h, i) => (
                      <div
                        key={h}
                        style={{
                          ...cellStyle(i),
                          fontSize: "7.5pt",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        {h}
                      </div>
                    ))}
                  </div>

                  {trecho.voos.map((voo) => (
                    <div
                      key={voo.id}
                      style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #f0f1f3" }}
                    >
                      <div style={cellStyle(0)}>
                        <SeloCompanhia companhia={voo.companhia} />
                      </div>
                      <div style={cellStyle(1)}>{voo.familiaTarifaria || "—"}</div>
                      <div style={cellStyle(2)}>
                        {voo.partida} → {voo.chegada}
                      </div>
                      <div style={cellStyle(3)}>{voo.duracao || "—"}</div>
                      <div style={cellStyle(4)}>{voo.escala || "—"}</div>
                      <div style={cellStyle(5)}>{voo.bagagemIncluida ? "Incluído" : "Não incluído"}</div>
                      <div style={{ ...cellStyle(6), fontWeight: 700, color: BLUE, fontSize: "10pt" }}>
                        {voo.preco ? `R$ ${formatarMoeda(voo.preco)}` : "—"}
                      </div>
                    </div>
                  ))}

                  {trecho.voos.length === 0 && (
                    <div style={{ padding: "12px 10px", color: "#9aa1a9", fontSize: "8.5pt", textAlign: "center" }}>
                      Nenhuma opção de voo adicionada ainda.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })}

      {/* Resumo — só no modo RT combinado */}
      {mode === "rt" && trechos.length > 0 && (
        <div className="flex justify-end" style={{ marginTop: 18 }}>
          <div style={{ width: 280, border: "1px solid #e5e7eb", borderRadius: 4, overflow: "hidden" }}>
            {totaisPorTrecho.map((t, i) => (
              <div
                key={t.trechoId}
                className="flex justify-between"
                style={{
                  padding: "7px 12px",
                  fontSize: "9pt",
                  borderBottom: "1px solid #f0f1f3",
                  background: "#fafbfc",
                }}
              >
                <span>
                  Menor tarifa {mode === "rt" ? (i === 0 ? "ida" : "volta") : `trecho ${i + 1}`}
                </span>
                <span>R$ {formatarMoeda(t.menor.toFixed(2).replace(".", ","))}</span>
              </div>
            ))}
            <div
              className="flex flex-col items-end"
              style={{ background: BLUE, color: "#fff", padding: "7px 12px", gap: 2 }}
            >
              <span style={{ fontSize: "7.5pt", letterSpacing: 0.4, textTransform: "uppercase", opacity: 0.85 }}>
                Total por passageiro
              </span>
              <span style={{ fontSize: "14pt", fontWeight: 700 }}>
                R$ {formatarMoeda(totalCombinado.toFixed(2).replace(".", ","))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex justify-between"
        style={{
          marginTop: 24,
          paddingTop: 10,
          borderTop: "1px solid #e5e7eb",
          fontSize: "7.5pt",
          color: "#9aa1a9",
        }}
      >
        <span>Flysmart Passagens</span>
        <span>Cotação gerada automaticamente — sujeita a confirmação</span>
      </div>
    </div>
  );
}
