
document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  function normalizar(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function numero(campo) {
    const valor = String($(campo).value || '').replace(',', '.');
    return Number(valor);
  }

  // CONVERSOR: dose em mL por volume de água.
  $('convCalcular').addEventListener('click', () => {
    const dose = numero('convDose');
    const base = numero('convBase');
    const alvo = numero('convAlvo');
    const resultado = $('convResultado');

    if (
      !Number.isFinite(dose) ||
      !Number.isFinite(base) ||
      !Number.isFinite(alvo) ||
      dose < 0 ||
      base <= 0 ||
      alvo <= 0 ||
      $('convDose').value.trim() === '' ||
      $('convBase').value.trim() === '' ||
      $('convAlvo').value.trim() === ''
    ) {
      resultado.textContent =
        'Preencha a dose em mL e os dois volumes de água com valores válidos.';
      return;
    }

    const calculado = dose * alvo / base;

    const formatado = calculado.toLocaleString('pt-BR', {
      maximumFractionDigits: 6
    });

    resultado.innerHTML =
      '<strong>Resultado matemático: ' +
      formatado +
      ' mL de produto para ' +
      alvo.toLocaleString('pt-BR') +
      ' litros de água.</strong>';
  });

  $('convLimpar').addEventListener('click', () => {
    $('convDose').value = '';
    $('convBase').value = '';
    $('convAlvo').value = '';
    $('convResultado').textContent =
      'Informe os valores para calcular a proporção.';
  });

  // CADASTRO DAS FRUTAS
  function clear() {
    form.reset();
    $('id').value = '';
  }

  function fruitUseText(produto, fruta) {
    const culturas = String(produto.cultura || '')
      .split(';')
      .map(item => item.trim())
      .filter(Boolean);

    const nomeFruta = normalizar(fruta);

    const encontrada = culturas.find(item => {
      const cultura = normalizar(item);

      if (nomeFruta === 'limao') {
        return cultura.startsWith('limao') ||
               cultura.startsWith('citros');
      }

      return cultura.startsWith(nomeFruta);
    });

    return encontrada || fruta;
  }

  function productBlock(produto, fruta) {
    const status = produto.statusIndicacao ||
      'Pendente de conferência';

    const dose = produto.dose ||
      'Em branco — preencher depois de conferir a bula ou ficha técnica';

    const modo = produto.modoAplicacao ||
      'Em branco — preencher conforme o rótulo ou a bula';

    return `
      <article class="item">
        <h4>${Sitio.esc(produto.nome || 'Produto sem nome')}</h4>

        <p>
          <strong>Cultura relacionada:</strong>
          ${Sitio.esc(fruitUseText(produto, fruta))}
        </p>

        <p>
          <strong>Para que serve:</strong>
          ${Sitio.esc(produto.alvo || 'Finalidade a confirmar no rótulo')}
        </p>

        <p>
          <strong>Dose:</strong>
          ${Sitio.esc(dose)}
        </p>

        <p>
          <strong>Modo de aplicação:</strong>
          ${Sitio.esc(modo)}
        </p>

        <p>
          <strong>Situação:</strong>
          ${Sitio.esc(status)}
        </p>

        ${
          produto.fonte
            ? `<p><a href="${Sitio.esc(produto.fonte)}"
                target="_blank" rel="noopener">Consultar fonte</a></p>`
            : ''
        }

        <div class="actions">
          <a class="button secondary"
             href="defensivos.html?edit=${encodeURIComponent(produto.id)}">
            Editar produto e dose
          </a>
        </div>
      </article>
    `;
  }

  function render() {
    const busca = normalizar($('filtro').value);

    const frutas = Sitio.fruits().filter(fruta =>
      normalizar([
        fruta.nome,
        fruta.variedade,
        fruta.talhao
      ].join(' ')).includes(busca)
    );

    $('lista').innerHTML = frutas.length
      ? frutas.map(fruta => {
          const produtos = Sitio.productsForFruit(fruta.nome);

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

              <h4>Produtos relacionados a esta fruta</h4>

              ${
                produtos.length
                  ? produtos.map(produto =>
                      productBlock(produto, fruta.nome)
                    ).join('')
                  : `
                    <p class="empty">
                      Ainda não há produtos associados a esta cultura
                      no catálogo. Abra “Ver produtos” para conferir
                      e cadastrar as associações necessárias.
                    </p>
                  `
              }

              <div class="actions">
                <button class="secondary" data-edit="${Sitio.esc(fruta.id)}">
                  Editar cultura
                </button>

                <a class="button secondary" href="defensivos.html">
                  Ver produtos
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

      if (confirm('Excluir esta cultura?')) {
        lista.splice(indice, 1);
        Sitio.set('frutas', lista);
        render();
        Sitio.flash('Cultura excluída.');
      }
    }
  });

  render();
});
