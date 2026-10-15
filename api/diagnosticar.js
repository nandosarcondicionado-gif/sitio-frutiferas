// Análise visual via OpenAI.
// Configure OPENAI_API_KEY no servidor da Vercel.

export const config = {
  api: {
    bodyParser: false
  }
};

import { IncomingForm } from 'formidable';
import fs from 'node:fs/promises';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método não permitido'
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: 'OPENAI_API_KEY não configurada no servidor.'
    });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 12 * 1024 * 1024,
      keepExtensions: true
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (error, fields, files) => {
        if (error) reject(error);
        else resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.image)
      ? files.image[0]
      : files.image;

    if (!file) {
      return res.status(400).json({
        error: 'Envie uma imagem no campo image.'
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

    const bytes = await fs.readFile(file.filepath);
    const mime = file.mimetype || 'image/jpeg';

    if (!mime.startsWith('image/')) {
      return res.status(400).json({
        error: 'O arquivo precisa ser uma imagem.'
      });
    }

    const dataUrl =
      'data:' + mime + ';base64,' + bytes.toString('base64');

    const prompt = `
Você é um assistente de triagem agrícola.

Examine a imagem e o contexto fornecido.
Não afirme certeza nem recomende nomes comerciais,
doses ou misturas de defensivos.

Diferencie sinais visíveis de inferências.
Se a foto não permitir conclusão, diga isso.

Responda somente JSON válido neste formato:
{
  "diagnosis": {
    "summary": "resumo em português",
    "confidence": "baixa|moderada|alta",
    "possibilities": [
      {
        "name": "hipótese",
        "reason": "evidência e limitações"
      }
    ],
    "observations": ["sinais realmente visíveis"],
    "next_steps": ["passos seguros para investigar"],
    "urgent_review": false
  }
}

Inclua no máximo 4 hipóteses.
Prefira investigação, manejo cultural e avaliação profissional.
Não prescreva pesticidas.

Contexto fornecido pelo usuário:
${JSON.stringify(context)}
`;

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
          temperature: 0.2,
          response_format: {
            type: 'json_object'
          },
          messages: [
            {
              role: 'system',
              content:
                'Responda em português do Brasil. Você não substitui um agrônomo. Não prescreva pesticidas.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
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
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'O serviço de análise de imagem recusou a solicitação.'
      });
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        error: 'A análise não retornou um resultado válido.'
      });
    }

    return res.status(200).json(JSON.parse(content));

  } catch (error) {
    return res.status(500).json({
      error: 'Falha ao analisar a imagem.',
      detail: process.env.NODE_ENV === 'development'
        ? String(error)
        : undefined
    });
  }
}
