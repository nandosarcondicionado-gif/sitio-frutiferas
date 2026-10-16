document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();
  Sitio.seedCatalog();

  const $ = id => document.getElementById(id);
  const form = $('form');

  const fields = [
    'nome',
    'categoria',
    'ingrediente',
    'alvo',
    'cultura',
    'dose',
    'modoAplicacao',
    'statusIndicacao',
    'registro',
    'fonte',
    'obs'
  ];

  function clearForm() {
    form.reset();
    $('id').value = '';
    $('tituloForm').textContent = 'Cadastrar ou editar produto';
    $('salvar').textContent = 'Salvar produto';
  }

  function render() {
    const query = ($('filtro').value || '').toLocaleLowerCase('pt-BR');

    const list = Sitio.products().filter(product =>
      fields
        .map(key => product[key] || '')
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(query)
    );

    $('lista').innerHTML = list.length
      ? list.map(product => `
          <article class="item">
            <h3>
              ${Sitio.esc(product.nome)}
              <span class="pill">${Sitio.esc(product.categoria || 'Classificação a confirmar')}</span>
            </h3>
            <p><strong>Composição:</strong> ${Sitio.esc(product.ingrediente || 'A confirmar no rótulo')}</p>
            <p><strong>Finalidade/alvo:</strong> ${Sitio.esc(product.alvo || 'A preencher após conferir a documentação')}</p>
            <p><strong>Culturas:</strong> ${Sitio.esc(product.cultura || 'Nenhuma cultura associada neste cadastro')}</p>
            <p><strong>Dose:</strong> ${Sitio.esc(product.dose || 'Não preenchida')}</p>
            <p><strong>Modo/época de aplicação:</strong> ${Sitio.esc(product.modoAplicacao || 'Não preenchido')}</p>
            <p><strong>Situação:</strong> ${Sitio.esc(product.statusIndicacao || 'Pendente de conferência')}</p>
            <p class="muted">
              ${Sitio.esc(product.registro || 'Registro a confirmar')}
              ${product.fonte ? ` • <a href="${Sitio.esc(product.fonte)}" target="_blank" rel="noopener">Abrir fonte</a>` : ''}
              ${product.obs ? ' • ' + Sitio.esc(product.obs) : ''}
            </p>
            <div class="actions">
              <button class="secondary" data-edit="${Sitio.esc(product.id)}">Editar dose/culturas</button>
              <button class="danger" data-del="${Sitio.esc(product.id)}">Excluir do catálogo</button>
            </div>
          </article>
        `).join('')
      : '<p class="empty">Nenhum produto encontrado.</p>';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const list = Sitio.products();
    const currentId = $('id').value;
    const obj = {};

    for (const key of fields) {
      obj[key] = ($(key).value || '').trim();
    }

    if (!obj.nome) {
      Sitio.flash('Informe o nome do produto.', 'error');
      return;
    }

    if (!obj.statusIndicacao) {
      obj.statusIndicacao = 'Pendente de conferência';
    }

    if (currentId) {
      const index = list.findIndex(item => String(item.id) === String(currentId));
      if (index < 0) {
        Sitio.flash('Produto não encontrado. Atualize a página e tente novamente.', 'error');
        return;
      }

      list[index] = { ...list[index], ...obj, updatedAt: new Date().toISOString() };
    } else {
      list.push({
        id: Sitio.id(),
        ...obj,
        createdAt: new Date().toISOString()
      });
    }

    Sitio.set('produtos', list);
    clearForm();
    render();
    Sitio.flash(currentId ? 'Produto atualizado.' : 'Produto cadastrado.');
  });

  $('limpar').addEventListener('click', clearForm);
  $('filtro').addEventListener('input', render);

  $('lista').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;

    const list = Sitio.products();
    const targetId = button.dataset.edit || button.dataset.del;
    const index = list.findIndex(item => String(item.id) === String(targetId));

    if (index < 0) return;

    if (button.dataset.del) {
      if (!confirm('Excluir este produto do catálogo? O registro no estoque não será apagado.')) return;

      list.splice(index, 1);
      Sitio.set('produtos', list);
      render();
      Sitio.flash('Produto removido do catálogo.');
      return;
    }

    const product = list[index];
    $('id').value = product.id;

    for (const key of fields) {
      if ($(key)) $(key).value = product[key] || '';
    }

    if (!$('statusIndicacao').value) {
      $('statusIndicacao').value = 'Pendente de conferência';
    }

    $('tituloForm').textContent = 'Editar: ' + product.nome;
    $('salvar').textContent = 'Salvar alterações';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  render();

  const wantedId = new URLSearchParams(location.search).get('edit');

  if (wantedId) {
    const product = Sitio.products().find(item => String(item.id) === wantedId);

    if (product) {
      $('id').value = product.id;

      for (const key of fields) {
        if ($(key)) $(key).value = product[key] || '';
      }

      if (!$('statusIndicacao').value) {
        $('statusIndicacao').value = 'Pendente de conferência';
      }

      $('tituloForm').textContent = 'Editar: ' + product.nome;
      $('salvar').textContent = 'Salvar alterações';
    }
  }
});
