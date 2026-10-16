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

  const apiKey = process.env.PLANTNET_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'O serviço de identificação ainda não foi configurado no servidor.'
    });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 12 * 1024 * 1024,
      maxFiles: 1,
      allowEmptyFiles: false,
      keepExtensions: true
    });

    const [, files] = await new Promise((resolve, reject) => {
      form.parse(req, (error, fields, parsedFiles) => {
        if (error) return reject(error);
        resolve([fields, parsedFiles]);
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

    if (!String(uploaded.mimetype || '').startsWith('image/')) {
      return res.status(400).json({
        error: 'O arquivo enviado não foi reconhecido como imagem.'
      });
    }

    const bytes = await fs.readFile(uploaded.filepath);
    const imageForm = new FormData();

    imageForm.append(
      'images',
      new Blob([bytes], { type: uploaded.mimetype || 'image/jpeg' }),
      'planta.jpg'
    );

    imageForm.append('organs', 'auto');

    const url =
      'https://my-api.plantnet.org/v2/identify/all?api-key=' +
      encodeURIComponent(apiKey);

    const response = await fetch(url, {
      method: 'POST',
      body: imageForm
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(502).json({
        error: 'O serviço de identificação não conseguiu processar a imagem.',
        statusServico: response.status
      });
    }

    if (!data || !Array.isArray(data.results)) {
      return res.status(502).json({
        error: 'O serviço de identificação retornou uma resposta inesperada.'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro na identificação botânica:', error);

    return res.status(500).json({
      error: 'Falha ao identificar a planta. Tente novamente.'
    });
  }
}
