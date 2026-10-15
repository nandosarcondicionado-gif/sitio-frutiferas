document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  function clear() {
    form.reset();
    $('id').value = '';
  }

  function render() {
    const query = $('filtro').value.toLowerCase();

    const list = Sitio.fruits().filter(f =>
      (f.nome + ' ' + (f.talhao || '') + ' ' +
       (f.variedade || '')).toLowerCase().includes(query)
    );

    $('lista').innerHTML = list.length
      ? list.map(f => `
        <article class="item">
          <h3>${Sitio.esc(f.nome)}
            ${f.variedade ? '— ' + Sitio.esc(f.variedade) : ''}
          </h3>
          <div class="muted">
            ${Sitio.esc(f.talhao || 'Sem talhão')} •
            ${Sitio.esc(f.quantidade || 'Quantidade não informada')} plantas •
            ${Sitio.esc(f.fase || 'Fase não informada')}
          </div>
          <p>${Sitio.esc(f.obs || 'Sem observações')}</p>
          <div class="actions">
            <button class="secondary" data-edit="${Sitio.esc(f.id)}">Editar</button>
            <a class="button secondary"
               href="busca.html?fruta=${encodeURIComponent(f.id)}">
              Fotografar/diagnosticar
            </a>
            <button class="danger" data-del="${Sitio.esc(f.id)}">Excluir</button>
          </div>
        </article>
      `).join('')
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
      talhao: $('talhao').value.trim(),
      idade: $('idade').value.trim(),
      fase: $('fase').value,
      obs: $('obs').value.trim()
    };

    if (!obj.nome) return;

    const index = list.findIndex(
      item => String(item.id) === String(obj.id)
    );

    if (index >= 0) {
      list[index] = obj;
    } else {
      list.push(obj);
    }

    Sitio.set('frutas', list);
    clear();
    render();
    Sitio.flash('Cultura salva com sucesso.');
  });

  $('limpar').onclick = clear;
  $('filtro').oninput = render;

  $('lista').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;

    const list = Sitio.fruits();

    const index = list.findIndex(item =>
      String(item.id) === button.dataset.edit ||
      String(item.id) === button.dataset.del
    );

    if (index < 0) return;

    if (button.dataset.edit) {
      const fruit = list[index];

      Object.keys(fruit).forEach(key => {
        if ($(key)) $(key).value = fruit[key] ?? '';
      });

      $('id').value = fruit.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } else if (confirm('Excluir esta cultura? Os registros históricos não serão apagados.')) {
      list.splice(index, 1);
      Sitio.set('frutas', list);
      render();
      Sitio.flash('Cultura excluída.');
    }
  });

  render();
});
