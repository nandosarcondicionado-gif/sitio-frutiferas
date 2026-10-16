document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  function clearForm() {
    form.reset();
    $('id').value = '';
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  function productBlock(product, fruitName) {
    const status = product.statusIndicacao || 'Pendente de conferência';

    return `
      <article class="item">
        <h4>${Sitio.esc(product.nome)}</h4>
        <p><strong>Cultura:</strong> ${Sitio.esc(fruitName)}</p>
        <p><strong>Finalidade/alvo:</strong> ${Sitio.esc(product.alvo || 'Conferir na documentação')}</p>
        <p><strong>Dose:</strong> ${Sitio.esc(product.dose || 'Ainda não preenchida')}</p>
        <p><strong>Modo de aplicação:</strong> ${Sitio.esc(product.modoAplicacao || 'Ainda não preenchido')}</p>
        <p><strong>Situação:</strong> ${Sitio.esc(status)}</p>
        ${product.fonte ? `<p><a href="${Sitio.esc(product.fonte)}" target="_blank" rel="noopener">Consultar fonte</a></p>` : ''}
        <div class="actions">
          <a class="button secondary" href="defensivos.html?edit=${encodeURIComponent(product.id)}">Editar indicação</a>
        </div>
      </article>
    `;
  }

  function render() {
    const query = $('filtro').value.toLocaleLowerCase('pt-BR');

    const list = Sitio.fruits().filter(fruit =>
      [
        fruit.nome,
        fruit.talhao,
        fruit.variedade,
        fruit.fase
      ].join(' ').toLocaleLowerCase('pt-BR').includes(query)
    );

    $('lista').innerHTML = list.length
      ? list.map(fruit => {
          const associated = Sitio.productsForFruit(fruit.nome);

          // Somente o status explícito de conferência da bula vigente
          // é considerado confirmado pelo usuário.
          const confirmed = associated.filter(product =>
            product.statusIndicacao === 'Confirmado após conferência da bula vigente'
          );

          const pending = associated.filter(product => !confirmed.includes(product));

          return `
            <article class="item">
              <h3>${Sitio.esc(fruit.nome)} ${fruit.variedade ? '— ' + Sitio.esc(fruit.variedade) : ''}</h3>
              <div class="muted">
                ${Sitio.esc(fruit.talhao || 'Sem talhão')} •
                ${Sitio.esc(fruit.quantidade || 'Quantidade não informada')} plantas •
                ${Sitio.esc(fruit.fase || 'Fase não informada')}
              </div>
              <p><strong>Idade:</strong> ${Sitio.esc(fruit.idade || 'Não informada')}</p>
              <p>${Sitio.esc(fruit.obs || 'Sem observações')}</p>

              <h4>Indicações confirmadas no cadastro</h4>
              ${
                confirmed.length
                  ? confirmed.map(product => productBlock(product, fruit.nome)).join('')
                  : '<p class="empty">Nenhum produto foi marcado como confirmado para esta cultura. Isso não significa que não existam produtos registrados; significa que o cadastro ainda não tem uma indicação conferida.</p>'
              }

              ${
                pending.length
                  ? `<h4>Indicações pendentes de conferência</h4>${pending.map(product => productBlock(product, fruit.nome)).join('')}`
                  : ''
              }

              <div class="actions">
                <button class="secondary" data-edit="${Sitio.esc(fruit.id)}">Editar cultura</button>
                <a class="button secondary" href="busca.html?fruta=${encodeURIComponent(fruit.id)}">Fotografar/diagnosticar</a>
                <a class="button secondary" href="defensivos.html">Ver produtos</a>
                <button class="danger" data-del="${Sitio.esc(fruit.id)}">Excluir</button>
              </div>
            </article>
          `;
        }).join('')
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const list = Sitio.fruits();
    const obj = {
      id: $('id').value || Sitio.id(),
      nome: $('nome').value.trim(),
      variedade: $('variedade').value.trim(),
      quantidade: $('quantidade').value,
      idade: $('idade').value.trim(),
      talhao: $('talhao').value.trim(),
      fase: $('fase').value,
      obs: $('obs').value.trim()
    };

    if (!obj.nome) {
      Sitio.flash('Informe o nome da cultura.', 'error');
      return;
    }

    const existingIndex = list.findIndex(item => String(item.id) === String(obj.id));

    if (existingIndex >= 0) {
      list[existingIndex] = obj;
    } else {
      list.push(obj);
    }

    Sitio.set('frutas', list);
    clearForm();
    render();
    Sitio.flash('Cultura salva com sucesso.');
  });

  $('limpar').addEventListener('click', clearForm);
  $('filtro').addEventListener('input', render);

  $('lista').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;

    const list = Sitio.fruits();

    if (button.dataset.edit) {
      const fruit = list.find(item => String(item.id) === button.dataset.edit);
      if (!fruit) return;

      Object.keys(fruit).forEach(key => {
        if ($(key)) $(key).value = fruit[key] ?? '';
      });

      $('id').value = fruit.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (button.dataset.del) {
      if (!confirm('Excluir esta cultura? Os registros históricos não serão apagados.')) return;

      const updated = list.filter(item => String(item.id) !== button.dataset.del);
      Sitio.set('frutas', updated);
      render();
      Sitio.flash('Cultura excluída.');
    }
  });

  render();
});
