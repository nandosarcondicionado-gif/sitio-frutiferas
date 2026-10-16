document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const fileInputs = ['camera', 'galeria'];

  let selectedFile = null;
  let photoForHistory = '';
  let lastResult = null;

  Sitio.renderFruitSelects();

  const params = new URLSearchParams(location.search);
  if (params.get('fruta')) $('fruta').value = params.get('fruta');

  function compressForHistory(file) {
    return new Promise(resolve => {
      const reader = new FileReader();

      reader.onerror = () => resolve('');

      reader.onload = () => {
        const image = new Image();

        image.onerror = () => resolve('');
        image.onload = () => {
          const maxSide = 1000;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');

          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));

          const context = canvas.getContext('2d');
          if (!context) {
            resolve('');
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          try {
            resolve(canvas.toDataURL('image/jpeg', 0.68));
          } catch {
            resolve('');
          }
        };

        image.src = reader.result;
      };

      reader.readAsDataURL(file);
    });
  }

  async function setFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Sitio.flash('Escolha um arquivo de imagem.', 'error');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      Sitio.flash('A imagem original deve ter no máximo 12 MB.', 'error');
      return;
    }

    selectedFile = file;
    photoForHistory = '';
    lastResult = null;
    $('resultado').hidden = true;

    const previewUrl = URL.createObjectURL(file);
    const oldUrl = $('preview').dataset.objectUrl;

    if (oldUrl) URL.revokeObjectURL(oldUrl);

    $('preview').dataset.objectUrl = previewUrl;
    $('preview').src = previewUrl;
    $('preview').hidden = false;

    photoForHistory = await compressForHistory(file);
  }

  fileInputs.forEach(id => {
    $(id).addEventListener('change', event => {
      setFile(event.target.files?.[0]);
    });
  });

  $('limparFoto').addEventListener('click', () => {
    selectedFile = null;
    photoForHistory = '';
    lastResult = null;

    fileInputs.forEach(id => { $(id).value = ''; });

    const oldUrl = $('preview').dataset.objectUrl;
    if (oldUrl) URL.revokeObjectURL(oldUrl);

    $('preview').dataset.objectUrl = '';
    $('preview').removeAttribute('src');
    $('preview').hidden = true;
    $('resultado').hidden = true;
    $('status').textContent = '';
  });

  function localTriage() {
    const symptoms = $('sintomas').value.toLocaleLowerCase('pt-BR');
    const hypotheses = [];

    if (/pó branco|branco.*folha|oídio/.test(symptoms)) {
      hypotheses.push(
        'Pode ser oídio ou outro crescimento superficial. Observe se aparece em outras folhas e registre fotos nítidas.'
      );
    }

    if (/amarel|clorose|folha amarela/.test(symptoms)) {
      hypotheses.push(
        'O amarelecimento pode estar associado a nutrição, irrigação, raízes, pragas ou doenças. Observe se atinge folhas novas ou antigas.'
      );
    }

    if (/mancha|ponto escuro|lesão/.test(symptoms)) {
      hypotheses.push(
        'Manchas podem ter causas infecciosas, ambientais ou estar relacionadas a fitotoxicidade. Formato, borda e distribuição ajudam na investigação.'
      );
    }

    if (/furo|mastig|comid|inseto|lagarta|pulg|cochonilha|ácaro/.test(symptoms)) {
      hypotheses.push(
        'Investigue possíveis pragas observando o verso das folhas, brotos, ovos, teias, melada ou fezes.'
      );
    }

    if (/murch|seca|caindo|queda/.test(symptoms)) {
      hypotheses.push(
        'Murcha e queda podem ocorrer por estresse hídrico, danos nas raízes, pragas ou doenças. Confira a umidade do solo e a drenagem.'
      );
    }

    if (!hypotheses.length) {
      hypotheses.push(
        'As informações ainda são insuficientes para levantar uma hipótese específica. Fotografe a planta inteira, o detalhe do sintoma e, se possível, o verso da folha.'
      );
    }

    return hypotheses;
  }

  function renderResult(result) {
    lastResult = result;
    $('resultado').hidden = false;
    $('resultText').innerHTML = result.html;
    $('resultado').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('analisar').addEventListener('click', async () => {
    if (!$('sintomas').value.trim()) {
      Sitio.flash('Descreva os sintomas antes de analisar.', 'error');
      return;
    }

    const button = $('analisar');
    button.disabled = true;
    $('status').innerHTML = '<p class="notice">Analisando os dados…</p>';

    try {
      const fruit = Sitio.fruits().find(item =>
        String(item.id) === $('fruta').value ||
        item.nome === $('fruta').value
      );

      const context = {
        culture: fruit?.nome || $('fruta').selectedOptions[0]?.text || 'Não informada',
        variety: fruit?.variedade || '',
        part: $('parte').value,
        symptoms: $('sintomas').value.trim(),
        distribution: $('distribuicao').value,
        onset: $('inicio').value.trim(),
        weather: $('clima').value
      };

      let species = null;
      let vision = null;
      let speciesError = '';
      let visionError = '';

      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('image', selectedFile);
          formData.append('context', JSON.stringify(context));

          const response = await fetch('/api/diagnosticar', {
            method: 'POST',
            body: formData
          });

          const data = await response.json().catch(() => ({}));

          if (response.ok) {
            vision = data;
          } else {
            visionError = data.error || 'A análise de imagem não está disponível.';
          }
        } catch {
          visionError = 'Não foi possível conectar ao serviço de análise.';
        }

        try {
          const formData = new FormData();
          formData.append('image', selectedFile);

          const response = await fetch('/api/identificar', {
            method: 'POST',
            body: formData
          });

          const data = await response.json().catch(() => ({}));

          if (response.ok) {
            species = data;
          } else {
            speciesError = data.error || 'A identificação botânica não está disponível.';
          }
        } catch {
          speciesError = 'Não foi possível conectar ao serviço de identificação.';
        }
      }

      const hypotheses = localTriage();
      let html = '';

      if (species?.results?.length) {
        html += '<h3>Possíveis espécies</h3><ul>';

        html += species.results.slice(0, 3).map(item => {
          const commonName = item.species?.commonNames?.[0] ||
            item.species?.scientificNameWithoutAuthor ||
            'Espécie não identificada';

          const scientificName = item.species?.scientificNameWithoutAuthor ||
            'Não informado';

          const score = Math.round((item.score || 0) * 100);

          return `<li><strong>${Sitio.esc(commonName)}</strong> — nome científico: ${Sitio.esc(scientificName)}; correspondência estimada: ${score}%</li>`;
        }).join('');

        html += '</ul>';
      } else if (selectedFile) {
        html += `<h3>Identificação da planta</h3><p>${Sitio.esc(speciesError || 'Não foi possível identificar a espécie. Confira a configuração do serviço e tente novamente.')}</p>`;
      } else {
        html += '<h3>Identificação da planta</h3><p>Nenhuma foto foi enviada. A análise abaixo usa apenas os sintomas descritos.</p>';
      }

      if (vision?.diagnosis) {
        const diagnosis = vision.diagnosis;

        html += `<h3>Análise visual assistida</h3><p>${Sitio.esc(diagnosis.summary || '')}</p>`;
        html += `<p><strong>Confiança estimada:</strong> ${Sitio.esc(diagnosis.confidence || 'indeterminada')}</p>`;

        if (Array.isArray(diagnosis.observations) && diagnosis.observations.length) {
          html += '<h4>Observações visuais</h4><ul>';
          html += diagnosis.observations.map(value => `<li>${Sitio.esc(value)}</li>`).join('');
          html += '</ul>';
        }

        if (Array.isArray(diagnosis.possibilities) && diagnosis.possibilities.length) {
          html += '<h4>Possibilidades a investigar</h4><ul>';
          html += diagnosis.possibilities.map(item =>
            `<li><strong>${Sitio.esc(item.name || 'Hipótese')}</strong>: ${Sitio.esc(item.reason || '')}</li>`
          ).join('');
          html += '</ul>';
        }

        if (Array.isArray(diagnosis.next_steps) && diagnosis.next_steps.length) {
          html += '<h4>Próximos passos</h4><ul>';
          html += diagnosis.next_steps.map(value => `<li>${Sitio.esc(value)}</li>`).join('');
          html += '</ul>';
        }
      } else {
        html += '<h3>Hipóteses iniciais a verificar</h3><ul>';
        html += hypotheses.map(value => `<li>${Sitio.esc(value)}</li>`).join('');
        html += '</ul>';
        html += `<p>${Sitio.esc(visionError || 'A triagem textual não equivale a um diagnóstico por imagem.')}</p>`;
      }

      html += `
        <div class="notice">
          <strong>Segurança:</strong> não aplique defensivo com base somente neste resultado.
          Confirme o diagnóstico e a autorização do produto para a cultura e finalidade,
          seguindo a bula e a orientação técnica.
        </div>
      `;

      renderResult({
        html,
        context,
        species,
        vision,
        photo: photoForHistory
      });

      $('status').textContent = '';
    } catch (error) {
      console.error(error);
      Sitio.flash('Ocorreu um erro ao analisar os dados. Tente novamente.', 'error');
    } finally {
      button.disabled = false;
    }
  });

  $('salvarDiagnostico').addEventListener('click', () => {
    if (!lastResult) return;

    try {
      const records = Sitio.diagnoses();

      records.unshift({
        id: Sitio.id(),
        date: Sitio.dateNow(),
        culture: lastResult.context.culture,
        context: lastResult.context,
        html: lastResult.html,
        photo: lastResult.photo || '',
        species: lastResult.species || null,
        vision: lastResult.vision || null
      });

      Sitio.set('diagnosticos', records);
      Sitio.flash('Triagem salva no histórico.');

      $('salvarDiagnostico').disabled = true;
    } catch (error) {
      console.error(error);
      Sitio.flash(
        'Não foi possível salvar. O armazenamento do navegador pode estar cheio; remova fotos antigas ou exporte um backup.',
        'error'
      );
    }
  });
});
