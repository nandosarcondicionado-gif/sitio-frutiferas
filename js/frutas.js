
document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  function limparFormulario() {
    form.reset();
    $('id').value = '';
  }

  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  function textoDaCultura(produto, nomeFruta) {
    const cultura = String(produto.cultura || '').trim();

    if (!cultura) {
      return 'Associação pendente — conferir se este produto pode ser usado nesta cultura.';
    }

    const partes = cultura.split(';').map(x => x.trim());
    const fruta = normalizar(nomeFruta);

    const encontrada = partes.find(parte => {
      const p = normalizar(parte);

      return p.includes(fruta) ||
        (fruta === 'limao' && p.includes('citros'));
    });

    return encontrada || cultura;
  }

  function indicacaoConfirmada(produto) {
    return normalizar(produto.statusIndicacao) ===
      'confirmado apos conferencia da bula vigente';
  }

  function blocoProduto(produto, nomeFruta) {
    const culturaTexto = textoDaCultura(produto, nomeFruta);
    const status = produto.statusIndicacao || 'Pendente de conferência';

    return `
      <article class="item">
        <h4>${Sitio.esc(produto.nome)}</h4>

        <p>
          <strong>Cultura/associação:</strong>
          ${Sitio.esc(culturaTexto)}
        </p>

        <p>
          <strong>Categoria:</strong>
          ${Sitio.esc(produto.categoria || 'A confirmar')}
        </p>

        <p>
          <strong>Composição:</strong>
          ${Sitio.esc(produto.ingrediente || 'Conferir no rótulo')}
        </p>

        <p>
          <strong>Finalidade/alvo:</strong>
          ${Sitio.esc(produto.alvo || 'Ainda não preenchido')}
        </p>

        <p>
          <strong>Dose:</strong>
          ${Sitio.esc(produto.dose || 'Ainda não preenchida')}
        </p>

        <p>
          <strong>Modo de aplicação:</strong>
          ${Sitio.esc(produto.modoAplicacao || 'Ainda não preenchido')}
        </p>

        <p>
          <strong>Situação:</strong>
          ${Sitio.esc(status)}
        </p>

        ${
          produto.registro
            ? `<p><strong>Registro/referência:</strong> ${Sitio.esc(produto.registro)}</p>`
            : ''
        }

        ${
          produto.fonte
            ? `<p><a href="${Sitio.esc(produto.fonte)}" target="_blank" rel="noopener">Consultar fonte</a></p>`
            : ''
        }

        <div class="actions">
          <a
            class="button secondary"
            href="defensivos.html?edit=${encodeURIComponent(produto.id)}"
          >Editar dose e indicação</a>
        </div>
      </article>
    `;
  }

  function renderizar() {
    const filtro = normalizar($('filtro').value);

    const culturas = Sitio.fruits().filter(fruta => {
      const texto = normalizar([
        fruta.nome,
        fruta.variedade,
        fruta.talhao,
        fruta.fase
      ].join(' '));

      return texto.includes(filtro);
    });

    $('lista').innerHTML = culturas.length
      ? culturas.map(fruta => {
          const produtos = Sitio.productsForFruit(fruta.nome);

          const confirmados = produtos.filter(indicacaoConfirmada);
          const pendentes = produtos.filter(p => !indicacaoConfirmada(p));

          return `
            <article class="item">
              <h3>
                ${Sitio.esc(fruta.nome)}
                ${fruta.variedade ? ' — ' + Sitio.esc(fruta.variedade) : ''}
              </h3>

              <div class="muted">
                ${Sitio.esc(fruta.talhao || 'Sem talhão')}
                • ${Sitio.esc(fruta.quantidade || 'Quantidade não informada')} plantas
                • ${Sitio.esc(fruta.fase || 'Fase não informada')}
              </div>

              <p>
                <strong>Idade:</strong>
                ${Sitio.esc(fruta.idade || 'Não informada')}
              </p>

              <p>
                <strong>Observações:</strong>
                ${Sitio.esc(fruta.obs || 'Nenhuma')}
              </p>

              <h4>Produtos com indicação confirmada</h4>

              ${
                confirmados.length
                  ? confirmados.map(p => blocoProduto(p, fruta.nome)).join('')
                  : `<p class="empty">Nenhum produto desta lista foi marcado como confirmado após conferência da bula vigente para esta cultura. Isso não significa que não existam produtos autorizados.</p>`
              }

              <h4>Produtos pendentes de associação ou conferência</h4>

              ${
                pendentes.length
                  ? pendentes.map(p => blocoProduto(p, fruta.nome)).join('')
                  : '<p class="muted">Nenhum produto pendente nesta lista.</p>'
              }

              <div class="actions">
                <button
                  type="button"
                  class="secondary"
                  data-edit="${Sitio.esc(fruta.id)}"
                >Editar cultura</button>

                <a
                  class="button secondary"
                  href="busca.html?fruta=${encodeURIComponent(fruta.id)}"
                >Fotografar/diagnosticar</a>

                <a
                  class="button secondary"
                  href="defensivos.html"
                >Ver os 17 produtos</a>

                <button
                  type="button"
                  class="danger"
                  data-del="${Sitio.esc(fruta.id)}"
                >Excluir</button>
              </div>
            </article>
          `;
        }).join('')
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const lista = Sitio.fruits();

    const fruta = {
      id: $('id').value || Sitio.id(),
      nome: $('nome').value.trim(),
      variedade: $('variedade').value.trim(),
      quantidade: $('quantidade').value,
      talhao: $('talhao').value.trim(),
      idade: $('idade').value.trim(),
      fase: $('fase').value,
      obs: $('obs').value.trim()
    };

    if (!fruta.nome) return;

    const indice = lista.findIndex(
      item => String(item.id) === String(fruta.id)
    );

    if (indice >= 0) {
      lista[indice] = fruta;
    } else {
      lista.push(fruta);
    }

    Sitio.set('frutas', lista);
    limparFormulario();
    renderizar();
    Sitio.flash('Cultura salva com sucesso.');
  });

  $('limpar').addEventListener('click', limparFormulario);
  $('filtro').addEventListener('input', renderizar);

  $('lista').addEventListener('click', e => {
    const botao = e.target.closest('button');

    if (!botao) return;

    const lista = Sitio.fruits();

    const indice = lista.findIndex(
      item =>
        String(item.id) === String(botao.dataset.edit) ||
        String(item.id) === String(botao.dataset.del)
    );

    if (indice < 0) return;

    if (botao.dataset.edit) {
      const fruta = lista[indice];

      Object.keys(fruta).forEach(chave => {
        if ($(chave)) {
          $(chave).value = fruta[chave] ?? '';
        }
      });

      $('id').value = fruta.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (botao.dataset.del && confirm(
      'Excluir esta cultura? Os registros históricos não serão apagados.'
    )) {
      lista.splice(indice, 1);
      Sitio.set('frutas', lista);
      renderizar();
      Sitio.flash('Cultura excluída.');
    }
  });

  renderizar();
});
