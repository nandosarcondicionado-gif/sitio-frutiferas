import { IncomingForm } from 'formidable';
import fs from 'node:fs/promises';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'O serviço de análise por imagem ainda não foi configurado no servidor.'
    });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 12 * 1024 * 1024,
      maxFiles: 1,
      allowEmptyFiles: false,
      keepExtensions: true
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (error, parsedFields, parsedFiles) => {
        if (error) return reject(error);
        resolve([parsedFields, parsedFiles]);
      });
    });

    const uploaded = Array.isArray(files.image)
      ? files.image[0]
      : files.image;

    if (!uploaded) {
      return res.status(400).json({
        error: 'Envie uma imagem no campo image.'
      });
    }

    const mime = uploaded.mimetype || '';

    if (!mime.startsWith('image/')) {
      return res.status(400).json({
        error: 'O arquivo precisa ser uma imagem.'
      });
    }

    const contextRaw = Array.isArray(fields.context)
      ? fields.context[0]
      : fields.context || '{}';

    let context = {};

    try {
      context = JSON.parse(contextRaw);
    } catch {
      context = {};
    }

    const bytes = await fs.readFile(uploaded.filepath);
    const dataUrl =
      'data:' + mime + ';base64,' + bytes.toString('base64');

    const prompt = `
Você é um assistente de triagem agrícola.

Analise a imagem e o contexto fornecido. Responda em português do Brasil.
Não declare um diagnóstico como certeza. Separe observações visíveis de
hipóteses. Não indique nomes comerciais, doses, misturas ou aplicação de
defensivos. Se a imagem não permitir conclusão, diga isso.

Retorne somente JSON válido neste formato:
{
  "diagnosis": {
    "summary": "resumo em português",
    "confidence": "baixa, moderada ou alta",
    "observations": ["sinais realmente visíveis"],
    "possibilities": [
      {"name": "hipótese", "reason": "evidências e limitações"}
    ],
    "next_steps": ["passos seguros para investigar"],
    "urgent_review": false
  }
}

Inclua no máximo quatro hipóteses. Prefira investigação, manejo cultural
seguro e avaliação profissional. Não prescreva pesticidas.

Contexto informado:
${JSON.stringify(context)}
`;

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Responda em português do Brasil. Você auxilia na triagem, não substitui um agrônomo. Não prescreva defensivos.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUrl,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1200
        })
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('Erro do serviço de análise:', response.status);

      return res.status(502).json({
        error: 'O serviço de análise recusou a solicitação. Confira a configuração da API.'
      });
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        error: 'O serviço de análise não retornou um resultado válido.'
      });
    }

    let result;

    try {
      result = JSON.parse(content);
    } catch {
      return res.status(502).json({
        error: 'O resultado recebido não estava em formato válido.'
      });
    }

    if (!result || !result.diagnosis) {
      return res.status(502).json({
        error: 'A resposta não contém os dados esperados da análise.'
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro na análise da imagem:', error);

    return res.status(500).json({
      error: 'Falha ao analisar a imagem. Tente novamente.'
    });
  }
}
