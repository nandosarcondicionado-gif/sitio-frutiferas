document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const form = $('form');

  function render() {
    const query = $('filtro').value.toLowerCase();

    const list = Sitio.products().filter(p =>
      (p.nome + ' ' + (p.ingrediente || '') + ' ' +
       (p.cultura || '')).toLowerCase().includes(query)
    );

    $('lista').innerHTML = list.length
      ? list.map(p => `
        <article class="item">
          <h3>${Sitio.esc(p.nome)}
            <span class="pill">${Sitio.esc(p.categoria || 'Outro')}</span>
          </h3>
          <p><strong>Composição:</strong> ${Sitio.esc(p.ingrediente || 'Não informada')}</p>
          <p><strong>Alvo/finalidade cadastrada:</strong> ${Sitio.esc(p.alvo || 'Não informada')}</p>
          <p><strong>Culturas informadas:</strong> ${Sitio.esc(p.cultura || 'Não informadas')}</p>
          <p class="muted">Registro/referência: ${Sitio.esc(p.registro || 'Não informado')}
            ${p.obs ? '• ' + Sitio.esc(p.obs) : ''}
          </p>
          <div class="actions">
            <button class="secondary" data-edit="${Sitio.esc(p.id)}">Editar</button>
            <button class="danger" data-del="${Sitio.esc(p.id)}">Excluir</button>
          </div>
        </article>
      `).join('')
      : '<p class="empty">Nenhum produto cadastrado.</p>';
  }

  function readForm() {
    return {
      nome: $('nome').value.trim(),
      categoria: $('categoria').value,
      ingrediente: $('ingrediente').value.trim(),
      alvo: $('alvo').value.trim(),
      cultura: $('cultura').value.trim(),
      registro: $('registro').value.trim(),
      obs: $('obs').value.trim()
    };
  }

  form.onsubmit = event => {
    event.preventDefault();

    const list = Sitio.products();
    list.push({
      id: Sitio.id(),
      ...readForm(),
      createdAt: new Date().toISOString()
    });

    Sitio.set('produtos', list);
    form.reset();
    render();
    Sitio.flash('Produto cadastrado.');
  };

  $('filtro').oninput = render;

  $('lista').onclick = event => {
    const button = event.target.closest('button');
    if (!button) return;

    const list = Sitio.products();
    const index = list.findIndex(item =>
      item.id === button.dataset.edit ||
      item.id === button.dataset.del
    );

    if (index < 0) return;

    if (button.dataset.del) {
      if (confirm('Excluir o cadastro deste produto? Os movimentos de estoque permanecem.')) {
        list.splice(index, 1);
        Sitio.set('produtos', list);
        render();
        Sitio.flash('Produto excluído.');
      }
      return;
    }

    const product = list[index];

    for (const key of [
      'nome', 'categoria', 'ingrediente',
      'alvo', 'cultura', 'registro', 'obs'
    ]) {
      if ($(key)) $(key).value = product[key] || '';
    }

    form.onsubmit = event => {
      event.preventDefault();

      Object.assign(product, readForm());
      list[index] = product;

      Sitio.set('produtos', list);
      form.reset();

      form.onsubmit = saveNew;
      render();
      Sitio.flash('Produto atualizado.');
    };
  };

  function saveNew(event) {
    event.preventDefault();

    const list = Sitio.products();
    list.push({
      id: Sitio.id(),
      ...readForm(),
      createdAt: new Date().toISOString()
    });

    Sitio.set('produtos', list);
    form.reset();
    render();
    Sitio.flash('Produto cadastrado.');
  }

  form.onsubmit = saveNew;
  render();
});
