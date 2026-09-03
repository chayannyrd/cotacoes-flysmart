import { NextRequest, NextResponse } from "next/server";

// Roda em Node.js (não edge), padrão do App Router — ok pra chamar a API
// externa da Anthropic sem restrição de tempo de execução do edge runtime.
export const runtime = "nodejs";

const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-haiku-4-5-20251001";

// Único formato que o formulário aceita pra companhia/família tarifária.
// Mantido em sincronia manual com src/types/quote.ts (FAMILIAS_TARIFARIAS)
// pra não precisar importar lógica de cliente aqui.
const FAMILIAS_TARIFARIAS: Record<string, string[]> = {
  GOL: ["Light", "Classic", "Flex"],
  LATAM: ["Light", "Standard", "Full"],
  AZUL: ["Light", "+Azul"],
};
const ESCALAS = ["Direto", "1 parada", "2 paradas"];

const SYSTEM_PROMPT = `Você recebe o print de uma busca de voo (site ou app de companhia aérea, ou comparador de passagens) e devolve os dados extraídos em JSON.

Responda APENAS com um JSON válido, sem markdown, sem texto antes ou depois, seguindo exatamente este formato:

{
  "origem": "string, ex: CGH - São Paulo (ou vazio se não identificar)",
  "destino": "string, ex: SDU - Rio de Janeiro (ou vazio se não identificar)",
  "data": "DD/MM/AAAA (ou vazio se não identificar)",
  "voos": [
    {
      "companhia": "GOL, LATAM ou AZUL (escolha a mais provável mesmo se o print mostrar outra cia; se não der pra saber, use GOL)",
      "familiaTarifaria": "uma das opções válidas pra companhia escolhida",
      "partida": "HH:MM",
      "chegada": "HH:MM",
      "escala": "Direto, 1 parada ou 2 paradas",
      "bagagemIncluida": true ou false,
      "preco": "valor em reais no formato 852,93 (sem R$, sem pontos de milhar)"
    }
  ]
}

Famílias tarifárias válidas por companhia:
GOL: Light, Classic, Flex
LATAM: Light, Standard, Full
AZUL: Light, +Azul

Se o print mostrar mais de uma opção de voo/tarifa pra mesma rota, inclua um item em "voos" pra cada uma. Se algum campo não estiver visível na imagem, faça a melhor estimativa possível a partir do que estiver visível; nunca deixe de retornar o JSON.`;

interface ExtractedVoo {
  companhia: string;
  familiaTarifaria: string;
  partida: string;
  chegada: string;
  escala: string;
  bagagemIncluida: boolean;
  preco: string;
}

interface ExtractedTrecho {
  origem: string;
  destino: string;
  data: string;
  voos: ExtractedVoo[];
}

function sanitizar(raw: unknown): ExtractedTrecho {
  const obj = (raw ?? {}) as Record<string, unknown>;

  const voosRaw = Array.isArray(obj.voos) ? obj.voos : [];
  const voos: ExtractedVoo[] = voosRaw.map((v) => {
    const voo = (v ?? {}) as Record<string, unknown>;
    const companhia = ["GOL", "LATAM", "AZUL"].includes(String(voo.companhia))
      ? String(voo.companhia)
      : "GOL";
    const familiasValidas = FAMILIAS_TARIFARIAS[companhia];
    const familiaTarifaria = familiasValidas.includes(String(voo.familiaTarifaria))
      ? String(voo.familiaTarifaria)
      : familiasValidas[0];
    const escala = ESCALAS.includes(String(voo.escala)) ? String(voo.escala) : ESCALAS[0];

    return {
      companhia,
      familiaTarifaria,
      partida: /^\d{2}:\d{2}$/.test(String(voo.partida)) ? String(voo.partida) : "",
      chegada: /^\d{2}:\d{2}$/.test(String(voo.chegada)) ? String(voo.chegada) : "",
      escala,
      bagagemIncluida: Boolean(voo.bagagemIncluida),
      preco: typeof voo.preco === "string" ? voo.preco.replace(/[^\d,]/g, "") : "",
    };
  });

  return {
    origem: typeof obj.origem === "string" ? obj.origem : "",
    destino: typeof obj.destino === "string" ? obj.destino : "",
    data: /^\d{2}\/\d{2}\/\d{4}$/.test(String(obj.data)) ? String(obj.data) : "",
    voos,
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  let body: { image?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { image, mediaType } = body;
  if (!image || !mediaType) {
    return NextResponse.json(
      { error: "Envie 'image' (base64) e 'mediaType' (ex: image/png)." },
      { status: 400 }
    );
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: image },
              },
              {
                type: "text",
                text: "Extraia os dados desse print de busca de voo, seguindo o formato JSON combinado.",
              },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Erro da API da Anthropic:", resp.status, errText);
      return NextResponse.json(
        { error: "Falha ao chamar a API de extração. Tente novamente." },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const textBlock = (data.content ?? []).find(
      (b: { type: string }) => b.type === "text"
    );
    const rawText: string = textBlock?.text ?? "{}";

    // Remove eventuais cercas de markdown (```json ... ```), caso o modelo
    // insista em incluir mesmo com a instrução de responder só JSON.
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Resposta não era JSON válido:", rawText);
      return NextResponse.json(
        { error: "Não consegui interpretar os dados extraídos. Tente um print mais nítido." },
        { status: 502 }
      );
    }

    return NextResponse.json(sanitizar(parsed));
  } catch (err) {
    console.error("Erro inesperado na extração:", err);
    return NextResponse.json({ error: "Erro inesperado. Tente novamente." }, { status: 500 });
  }
}
