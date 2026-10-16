document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);

  function render() {
    const query = ($('filtro').value || '').toLocaleLowerCase('pt-BR');
    const type = $('tipo').value;

    let rows = [];

    if (type !== 'diagnosticos') {
      rows = rows.concat(
        Sitio.apps().map(item => ({ ...item, _type: 'Aplicação' }))
      );
    }

    if (type !== 'aplicacoes') {
      rows = rows.concat(
        Sitio.diagnoses().map(item => ({ ...item, _type: 'Foto/diagnóstico' }))
      );
    }

    rows = rows
      .filter(item => JSON.stringify(item).toLocaleLowerCase('pt-BR').includes(query))
      .sort((a, b) =>
        String(b.date || b.data || '').localeCompare(String(a.date || a.data || ''))
      );

    $('lista').innerHTML = rows.length
      ? rows.map(item => `
          <article class="item">
            <h3>
              ${Sitio.esc(item._type)} —
              ${Sitio.esc(item.culture || item.fruta || item.cultura || 'Cultura não informada')}
            </h3>
            <div class="muted">${Sitio.fmtDate(item.date || item.data)}</div>

            ${
              item._type === 'Aplicação'
                ? `
                  <p>
                    <strong>Produto/manejo:</strong> ${Sitio.esc(item.produto || 'Não informado')}<br>
                    <strong>Quantidade:</strong>
                    ${Sitio.esc(item.quantidade || 'Não informada')}
                    ${Sitio.esc(item.unidade || '')}<br>
                    <strong>Responsável:</strong> ${Sitio.esc(item.responsavel || 'Não informado')}<br>
                    ${Sitio.esc(item.motivo || item.obs || '')}
                  </p>
                `
                : `
                  <p>${Sitio.esc(item.context?.symptoms || 'Sem sintomas descritos')}</p>
                  ${item.photo ? `<img class="preview" src="${Sitio.esc(item.photo)}" alt="Foto salva do diagnóstico">` : ''}
                  <details>
                    <summary>Ver resultado registrado</summary>
                    <div>${item.html || 'Sem análise salva.'}</div>
                  </details>
                `
            }

            <div class="actions">
              <button class="danger" data-del="${Sitio.esc(item.id)}" data-kind="${Sitio.esc(item._type)}">Excluir registro</button>
            </div>
          </article>
        `).join('')
      : '<p class="empty">Nenhum registro encontrado.</p>';
  }

  $('filtro').addEventListener('input', render);
  $('tipo').addEventListener('change', render);

  $('lista').addEventListener('click', event => {
    const button = event.target.closest('[data-del]');
    if (!button) return;

    if (!confirm('Excluir este registro do histórico?')) return;

    if (button.dataset.kind === 'Aplicação') {
      Sitio.set(
        'aplicacoes',
        Sitio.apps().filter(item => String(item.id) !== button.dataset.del)
      );
    } else {
      Sitio.set(
        'diagnosticos',
        Sitio.diagnoses().filter(item => String(item.id) !== button.dataset.del)
      );
    }

    render();
    Sitio.flash('Registro excluído.');
  });

  $('backup').addEventListener('click', () => {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      frutas: Sitio.fruits(),
      produtos: Sitio.products(),
      estoque: Sitio.stock(),
      movimentos: Sitio.get('movimentos', []),
      aplicacoes: Sitio.apps(),
      diagnosticos: Sitio.diagnoses()
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-sitio-frutiferas-' + Sitio.dateNow() + '.json';
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('restore').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backup = JSON.parse(await file.text());
      const keys = [
        'frutas',
        'produtos',
        'estoque',
        'movimentos',
        'aplicacoes',
        'diagnosticos'
      ];

      if (!backup || typeof backup !== 'object') {
        throw new Error('Formato inválido');
      }

      const valid = keys.some(key => Array.isArray(backup[key]));
      if (!valid) throw new Error('Backup sem dados reconhecidos');

      for (const key of keys) {
        if (Array.isArray(backup[key])) Sitio.set(key, backup[key]);
      }

      render();
      Sitio.flash('Backup restaurado neste navegador.');
    } catch {
      Sitio.flash('Arquivo de backup inválido ou incompatível.', 'error');
    }

    event.target.value = '';
  });

  render();
});
