// Identificação botânica via PlantNet.
// Configure PLANTNET_API_KEY nas variáveis de ambiente da Vercel.

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

  if (!process.env.PLANTNET_API_KEY) {
    return res.status(503).json({
      error: 'PLANTNET_API_KEY não configurada no servidor.'
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

    const bytes = await fs.readFile(file.filepath);

    const formData = new FormData();

    formData.append(
      'images',
      new Blob([bytes], {
        type: file.mimetype || 'image/jpeg'
      }),
      'planta.jpg'
    );

    formData.append('organs', 'auto');

    const url =
      'https://my-api.plantnet.org/v2/identify/all?api-key=' +
      encodeURIComponent(process.env.PLANTNET_API_KEY);

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({
      error: 'Falha na identificação botânica.',
      detail: process.env.NODE_ENV === 'development'
        ? String(error)
        : undefined
    });
  }
}
