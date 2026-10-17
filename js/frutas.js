
document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  function clear() {
    form.reset();
    $('id').value = '';
  }

  function productBlock(p, fruitName) {
    return `
      <article class="item">
        <h4>${Sitio.esc(p.nome)}</h4>
        <p><strong>Cultura:</strong> ${Sitio.esc(fruitName)}</p>
        <p><strong>Finalidade/alvo:</strong>
          ${Sitio.esc(p.alvo || 'Conferir no rótulo')}
        </p>
        <p><strong>Dose cadastrada:</strong>
          ${Sitio.esc(p.dose || 'Não preenchida')}
        </p>
        <p><strong>Modo de aplicação:</strong>
          ${Sitio.esc(p.modoAplicacao || 'Não preenchido')}
        </p>
        <p><strong>Situação:</strong>
          ${Sitio.esc(p.statusIndicacao || 'Pendente de conferência')}
        </p>
        ${p.fonte ? `
          <p>
            <a href="${Sitio.esc(p.fonte)}"
               target="_blank" rel="noopener">
              Consultar bula/fonte
            </a>
          </p>` : ''}
        <div class="actions">
          <a class="button secondary"
             href="defensivos.html?edit=${encodeURIComponent(p.id)}">
            Ver cadastro do produto
          </a>
        </div>
      </article>`;
  }

  function render() {
    const q = $('filtro').value.toLowerCase();

    const list = Sitio.fruits().filter(f =>
      (f.nome + ' ' + (f.talhao || '') + ' ' + (f.variedade || ''))
        .toLowerCase().includes(q)
    );

    $('lista').innerHTML = list.length
      ? list.map(f => {
          const confirmed = Sitio.productsForFruit(f.nome);

          return `
            <article class="item">
              <h3>${Sitio.esc(f.nome)}
                ${f.variedade ? '— ' + Sitio.esc(f.variedade) : ''}
              </h3>

              <div class="muted">
                ${Sitio.esc(f.talhao || 'Sem talhão')} •
                ${Sitio.esc(f.quantidade || 'Quantidade não informada')}
                plantas •
                ${Sitio.esc(f.fase || 'Fase não informada')}
              </div>

              <p>${Sitio.esc(f.obs || 'Sem observações')}</p>

              <h4>Produtos confirmados para esta fruta</h4>

              ${
                confirmed.length
                  ? confirmed.map(p => productBlock(p, f.nome)).join('')
                  : `<p class="notice">
                      Nenhum dos produtos cadastrados está liberado
                      para aparecer aqui como recomendação confirmada
                      para ${Sitio.esc(f.nome)}.

                      Isso não significa que não existam produtos
                      registrados para essa cultura. Significa que,
                      entre os produtos cadastrados, ainda não há uma
                      indicação confirmada suficiente para ser exibida
                      com segurança.
                    </p>`
              }

              <div class="actions">
                <button class="secondary" data-edit="${Sitio.esc(f.id)}">
                  Editar cultura
                </button>

                <a class="button secondary"
                   href="busca.html?fruta=${encodeURIComponent(f.id)}">
                  Fotografar/diagnosticar
                </a>

                <a class="button secondary" href="defensivos.html">
                  Consultar catálogo de produtos
                </a>

                <button class="danger" data-del="${Sitio.esc(f.id)}">
                  Excluir
                </button>
              </div>
            </article>`;
        }).join('')
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

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

    const i = list.findIndex(x => String(x.id) === String(obj.id));
    if (i >= 0) list[i] = { ...list[i], ...obj };
    else list.push(obj);

    Sitio.set('frutas', list);
    clear();
    render();
    Sitio.flash('Cultura salva com sucesso.');
  });

  $('limpar').onclick = clear;
  $('filtro').oninput = render;

  $('lista').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;

    const list = Sitio.fruits();
    const i = list.findIndex(x =>
      String(x.id) === b.dataset.edit ||
      String(x.id) === b.dataset.del
    );

    if (i < 0) return;

    if (b.dataset.edit) {
      const f = list[i];

      Object.keys(f).forEach(k => {
        if ($(k)) $(k).value = f[k] ?? '';
      });

      $('id').value = f.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (
      b.dataset.del &&
      confirm('Excluir esta cultura? Os registros históricos não serão apagados.')
    ) {
      list.splice(i, 1);
      Sitio.set('frutas', list);
      render();
      Sitio.flash('Cultura excluída.');
    }
  });

  render();
});
