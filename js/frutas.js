
document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  const normalizar = texto =>
    String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();

  function clear() {
    form.reset();
    $('id').value = '';
  }

  function culturaCorrespondente(produto, nomeFruta) {
    const culturas = String(produto.cultura || '')
      .split(';')
      .map(item => item.trim())
      .filter(Boolean);

    const fruta = normalizar(nomeFruta);

    return culturas.find(item => {
      const cultura = normalizar(item);

      if (fruta === 'limao') {
        return cultura.startsWith('limao') ||
               cultura.startsWith('citros');
      }

      if (fruta === 'pessego') {
        return cultura.startsWith('pessego') ||
               cultura.startsWith('pessegueiro');
      }

      if (fruta === 'maca') {
        return cultura.startsWith('maca');
      }

      if (fruta === 'caqui') {
        return cultura.startsWith('caqui');
      }

      return cultura.startsWith(fruta);
    }) || '';
  }

  function statusProduto(produto) {
    const status = normalizar(produto.statusIndicacao);

    if (status.startsWith('confirmado na bula vigente')) {
      return 'vigente';
    }

    if (status.startsWith('confirmado na bula consultada')) {
      return 'documentado';
    }

    return 'pendente';
  }

  function blocoProduto(produto, fruta, situacao) {
    const cultura = culturaCorrespondente(produto, fruta);
    const status = statusProduto(produto);

    let aviso = '';

    if (situacao === 'vigente') {
      aviso = 'Indicação marcada como confirmada na bula vigente. Confira a embalagem e as condições de uso antes de aplicar.';
    } else if (situacao === 'documentado') {
      aviso = 'Há uma indicação documentada em fonte consultada, mas é necessário conferir a bula vigente antes de aplicar.';
    } else {
      aviso = 'Ainda não está confirmado que esta indicação seja autorizada para esta fruta e este alvo. Não use como recomendação de aplicação.';
    }

    return `
      <article class="item">
        <h4>${Sitio.esc(produto.nome || 'Produto sem nome')}</h4>

        <p>
          <strong>Cultura:</strong>
          ${Sitio.esc(cultura || fruta)}
        </p>

        <p>
          <strong>Finalidade ou alvo:</strong>
          ${Sitio.esc(produto.alvo || 'Ainda não confirmado')}
        </p>

        <p>
          <strong>Dose cadastrada:</strong>
          ${Sitio.esc(produto.dose || 'Não confirmada — consultar a bula')}
        </p>

        <p>
          <strong>Modo de aplicação:</strong>
          ${Sitio.esc(produto.modoAplicacao || 'Não confirmado — consultar a bula')}
        </p>

        <p>
          <strong>Situação:</strong>
          ${Sitio.esc(produto.statusIndicacao || 'Pendente de conferência')}
        </p>

        <p class="notice">${Sitio.esc(aviso)}</p>

        ${
          produto.fonte
            ? `<p><a href="${Sitio.esc(produto.fonte)}"
                target="_blank" rel="noopener">Consultar fonte</a></p>`
            : ''
        }

        <div class="actions">
          <a class="button secondary"
             href="defensivos.html?edit=${encodeURIComponent(produto.id)}">
            Editar produto
          </a>
        </div>
      </article>
    `;
  }

  function render() {
    const busca = normalizar($('filtro').value);

    const frutas = Sitio.fruits().filter(fruta => {
      const texto = normalizar([
        fruta.nome,
        fruta.variedade,
        fruta.talhao
      ].join(' '));

      return texto.includes(busca);
    });

    $('lista').innerHTML = frutas.length
      ? frutas.map(fruta => {
          const produtos = Sitio.productsForFruit(fruta.nome);

          const documentados = produtos.filter(produto =>
            statusProduto(produto) === 'vigente' ||
            statusProduto(produto) === 'documentado'
          );

          const pendentes = produtos.filter(produto =>
            statusProduto(produto) === 'pendente'
          );

          return `
            <article class="item">
              <h3>
                ${Sitio.esc(fruta.nome)}
                ${fruta.variedade
                  ? ' — ' + Sitio.esc(fruta.variedade)
                  : ''}
              </h3>

              <p class="muted">
                ${Sitio.esc(fruta.talhao || 'Sem talhão')}
                • ${Sitio.esc(fruta.quantidade || 'Quantidade não informada')}
                plantas
                • ${Sitio.esc(fruta.fase || 'Fase não informada')}
              </p>

              <p>${Sitio.esc(fruta.obs || 'Sem observações')}</p>

              <h4>Indicações documentadas — conferir a bula vigente</h4>

              ${
                documentados.length
                  ? documentados.map(produto =>
                      blocoProduto(produto, fruta.nome, statusProduto(produto))
                    ).join('')
                  : '<p class="empty">Nenhum produto do catálogo tem indicação confirmada na bula vigente para esta fruta.</p>'
              }

              ${
                pendentes.length
                  ? `
                    <h4>Produtos que precisam de conferência</h4>
                    ${pendentes.map(produto =>
                      blocoProduto(produto, fruta.nome, 'pendente')
                    ).join('')}
                  `
                  : ''
              }

              <div class="actions">
                <button class="secondary" data-edit="${Sitio.esc(fruta.id)}">
                  Editar cultura
                </button>

                <a class="button secondary"
                   href="busca.html?fruta=${encodeURIComponent(fruta.id)}">
                  Fotografar/diagnosticar
                </a>

                <a class="button secondary" href="defensivos.html">
                  Ver os 17 produtos
                </a>

                <button class="danger" data-del="${Sitio.esc(fruta.id)}">
                  Excluir
                </button>
              </div>
            </article>
          `;
        }).join('')
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const lista = Sitio.fruits();
    const objeto = {
      id: $('id').value || Sitio.id(),
      nome: $('nome').value.trim(),
      variedade: $('variedade').value.trim(),
      quantidade: $('quantidade').value,
      talhao: $('talhao').value.trim(),
      idade: $('idade').value.trim(),
      fase: $('fase').value,
      obs: $('obs').value.trim()
    };

    if (!objeto.nome) return;

    const indice = lista.findIndex(
      item => String(item.id) === String(objeto.id)
    );

    if (indice >= 0) {
      lista[indice] = { ...lista[indice], ...objeto };
    } else {
      lista.push(objeto);
    }

    Sitio.set('frutas', lista);
    clear();
    render();
    Sitio.flash('Cultura salva com sucesso.');
  });

  $('limpar').addEventListener('click', clear);
  $('filtro').addEventListener('input', render);

  $('lista').addEventListener('click', event => {
    const botao = event.target.closest('button');
    if (!botao) return;

    const lista = Sitio.fruits();

    if (botao.dataset.edit) {
      const fruta = lista.find(
        item => String(item.id) === String(botao.dataset.edit)
      );

      if (!fruta) return;

      Object.keys(fruta).forEach(chave => {
        if ($(chave)) $(chave).value = fruta[chave] ?? '';
      });

      $('id').value = fruta.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (botao.dataset.del) {
      const indice = lista.findIndex(
        item => String(item.id) === String(botao.dataset.del)
      );

      if (indice < 0) return;

      if (confirm('Excluir esta cultura? Os registros históricos não serão apagados.')) {
        lista.splice(indice, 1);
        Sitio.set('frutas', lista);
        render();
        Sitio.flash('Cultura excluída.');
      }
    }
  });

  render();
});
