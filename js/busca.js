document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const fileInputs = ['camera', 'galeria'];

  let file = null;
  let previewData = '';
  let lastResult = null;

  Sitio.renderFruitSelects();

  const params = new URLSearchParams(location.search);
  if (params.get('fruta')) $('fruta').value = params.get('fruta');

  function setFile(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      Sitio.flash('Escolha um arquivo de imagem.', 'error');
      return;
    }

    if (selectedFile.size > 12 * 1024 * 1024) {
      Sitio.flash('A imagem deve ter no máximo 12 MB.', 'error');
      return;
    }

    file = selectedFile;

    const url = URL.createObjectURL(selectedFile);
    $('preview').src = url;
    $('preview').hidden = false;

    const reader = new FileReader();

    reader.onload = () => {
      previewData = reader.result;
    };

    reader.readAsDataURL(selectedFile);
  }

  fileInputs.forEach(id => {
    $(id).addEventListener('change', event => {
      setFile(event.target.files?.[0]);
    });
  });

  $('limparFoto').onclick = () => {
    file = null;
    previewData = '';

    fileInputs.forEach(id => {
      $(id).value = '';
    });

    $('preview').hidden = true;
    $('preview').removeAttribute('src');
  };

  function localTriage() {
    const symptoms = $('sintomas').value.toLowerCase();
    const hypotheses = [];

    if (/pó branco|branco.*folha|oídio/.test(symptoms)) {
      hypotheses.push(
        'Possibilidade de oídio ou outro crescimento superficial; ' +
        'confira se o sinal pode ser removido suavemente e se aparece em outras folhas.'
      );
    }

    if (/amarel|clorose|folha amarela/.test(symptoms)) {
      hypotheses.push(
        'Amarelecimento pode estar associado a nutrição, irrigação, raízes ' +
        'ou pragas; observe se ocorre em folhas novas ou antigas.'
      );
    }

    if (/mancha|ponto escuro|lesão/.test(symptoms)) {
      hypotheses.push(
        'Manchas podem ter causas fúngicas, bacterianas, ambientais ou por ' +
        'fitotoxicidade; formato, borda e distribuição ajudam a diferenciar.'
      );
    }

    if (/furo|mastig|comid|inseto|lagarta|pulg|cochonilha|ácaro/.test(symptoms)) {
      hypotheses.push(
        'Investigue pragas: observe o verso das folhas, brotos e presença ' +
        'de insetos, teias, melada ou fezes.'
      );
    }

    if (/murch|seca|caindo|queda/.test(symptoms)) {
      hypotheses.push(
        'Murcha e queda podem ocorrer por estresse hídrico, danos nas raízes, ' +
        'pragas ou doenças vasculares. Confira a umidade do solo sem encharcar.'
      );
    }

    if (!hypotheses.length) {
      hypotheses.push(
        'As informações ainda são insuficientes para listar uma hipótese específica. ' +
        'Fotografe a planta inteira, o detalhe do sintoma e, se possível, o verso da folha.'
      );
    }

    return hypotheses;
  }

  function renderResult(result) {
    lastResult = result;

    $('resultado').hidden = false;
    $('resultText').innerHTML = result.html;

    $('salvarDiagnostico').disabled = false;

    $('resultado').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  $('analisar').onclick = async () => {
    if (!$('sintomas').value.trim()) {
      Sitio.flash('Descreva os sintomas antes de analisar.', 'error');
      return;
    }

    const button = $('analisar');
    button.disabled = true;

    $('status').innerHTML =
      '<p class="notice">Analisando os dados…</p>';

    try {
      const fruit = Sitio.fruits().find(item =>
        String(item.id) === $('fruta').value ||
        item.nome === $('fruta').value
      );

      const context = {
        culture: fruit?.nome ||
          $('fruta').selectedOptions[0]?.text ||
          'Não informada',
        variety: fruit?.variedade || '',
        part: $('parte').value,
        symptoms: $('sintomas').value.trim(),
        distribution: $('distribuicao').value,
        onset: $('inicio').value.trim(),
        weather: $('clima').value
      };

      let species = null;
      let vision = null;

      if (file) {
        try {
          const form = new FormData();
          form.append('image', file);
          form.append('context', JSON.stringify(context));

          const response = await fetch('/api/diagnosticar', {
            method: 'POST',
            body: form
          });

          if (response.ok) {
            vision = await response.json();
          }
        } catch (error) {
          console.warn('Análise visual indisponível:', error);
        }

        try {
          const form = new FormData();
          form.append('image', file);

          const response = await fetch('/api/identificar', {
            method: 'POST',
            body: form
          });

          if (response.ok) {
            species = await response.json();
          }
        } catch (error) {
          console.warn('Identificação botânica indisponível:', error);
        }
      }

      const hypotheses = localTriage();
      let html = '';

      if (species?.results?.length) {
        html += '<h3>Possíveis espécies (PlantNet)</h3><ul>';

        html += species.results.slice(0, 3).map(item => {
          const name =
            item.species?.commonNames?.[0] ||
            item.species?.scientificNameWithoutAuthor ||
            'Espécie não identificada';

          const scientific =
            item.species?.scientificNameWithoutAuthor ||
            'Não informado';

          const score = Math.round((item.score || 0) * 100);

          return `<li>
            <strong>${Sitio.esc(name)}</strong> —
            nome científico: ${Sitio.esc(scientific)};
            correspondência ${score}%
          </li>`;
        }).join('');

        html += '</ul>';
      } else {
        html += `
          <h3>Identificação da planta</h3>
          <p>Não foi possível consultar o serviço de identificação.
          Confira a configuração do servidor e tente novamente.
          A espécie não será adivinhada.</p>
        `;
      }

      if (vision?.diagnosis) {
        const diagnosis = vision.diagnosis;

        html += `
          <h3>Análise visual assistida</h3>
          <p>${Sitio.esc(diagnosis.summary || '')}</p>
          <p><strong>Confiança estimada:</strong>
          ${Sitio.esc(diagnosis.confidence || 'indeterminada')}</p>
        `;

        if (diagnosis.possibilities?.length) {
          html += '<ul>' + diagnosis.possibilities.map(item => `
            <li><strong>${Sitio.esc(item.name)}</strong>:
            ${Sitio.esc(item.reason || '')}</li>
          `).join('') + '</ul>';
        }

        if (diagnosis.next_steps?.length) {
          html += '<h4>Próximos passos</h4><ul>' +
            diagnosis.next_steps.map(step =>
              `<li>${Sitio.esc(step)}</li>`
            ).join('') +
            '</ul>';
        }
      } else {
        html += '<h3>Hipóteses iniciais a verificar</h3><ul>' +
          hypotheses.map(item =>
            `<li>${Sitio.esc(item)}</li>`
          ).join('') +
          '</ul>';

        html += `
          <p>O diagnóstico automático por imagem não está disponível
          até configurar a API de análise no servidor. Esta lista é
          uma triagem baseada no texto informado, não uma leitura da foto.</p>
        `;
      }

      html += `
        <div class="notice">
          <strong>Segurança:</strong> não aplique defensivo com base
          somente neste resultado. Confirme o diagnóstico e a autorização
          do produto para a cultura e finalidade, seguindo a bula e a orientação técnica.
        </div>
      `;

      renderResult({
        html,
        context,
        species,
        vision,
        photo: previewData
      });

    } finally {
      $('status').textContent = '';
      button.disabled = false;
    }
  };

  $('salvarDiagnostico').onclick = () => {
    if (!lastResult) return;

    const all = Sitio.diagnoses();

    all.unshift({
      id: Sitio.id(),
      date: Sitio.dateNow(),
      culture: lastResult.context.culture,
      context: lastResult.context,
      html: lastResult.html,
      photo: lastResult.photo || '',
      species: lastResult.species || null,
      vision: lastResult.vision || null
    });

    Sitio.set('diagnosticos', all);

    Sitio.flash('Diagnóstico/triagem salvo no histórico.');
    $('salvarDiagnostico').disabled = true;
  };
});
