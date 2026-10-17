
document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();
  Sitio.seedCatalog();

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  const norm = s => String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();

  const val = (obj, key, fallback = '') =>
    obj && obj[key] != null ? obj[key] : fallback;

  function clearForm() {
    form.reset();
    $('id').value = '';
  }

  // Junta os produtos do catálogo e do estoque.
  // Se o mesmo produto estiver nos dois, não duplica na seleção.
  function availableProducts() {
    const catalog = Sitio.products().filter(p => p && p.nome);
    const stock = Sitio.stock().filter(p => p && p.nome);
    const byName = new Map();

    catalog.forEach(p => {
      byName.set(norm(p.nome), {
        ref: 'p:' + String(p.id),
        id: String(p.id),
        source: 'catalog',
        nome: p.nome,
        categoria: p.categoria || '',
        ingrediente: p.ingrediente || '',
        alvo: p.alvo || '',
        dose: p.dose || '',
        modoAplicacao: p.modoAplicacao || '',
        statusIndicacao:
          p.statusIndicacao || 'Pendente de conferência',
        registro: p.registro || '',
        fonte: p.fonte || '',
        obs: p.obs || '',
        estoqueQtd: null,
        estoqueUnidade: ''
      });
    });

    stock.forEach(s => {
      const key = norm(s.nome);
      const existing = byName.get(key);

      if (existing) {
        existing.estoqueQtd = s.qtd ?? s.quantidade ?? null;
        existing.estoqueUnidade = s.unidade || '';
      } else {
        byName.set(key, {
          ref: 's:' + String(s.id),
          id: String(s.id),
          source: 'stock',
          nome: s.nome,
          categoria: s.categoria || '',
          ingrediente: s.ingrediente || '',
          alvo: '',
          dose: '',
          modoAplicacao: '',
          statusIndicacao: 'Pendente de conferência',
          registro: '',
          fonte: '',
          obs: s.obs || '',
          estoqueQtd: s.qtd ?? s.quantidade ?? null,
          estoqueUnidade: s.unidade || ''
        });
      }
    });

    return [...byName.values()].sort(
      (a, b) => a.nome.localeCompare(b.nome, 'pt-BR')
    );
  }

  // Mantém as associações que já existiam no catálogo.
  function autoAssociations(fruit) {
    return Sitio.productsForFruit(fruit.nome).map(p => ({
      ref: 'p:' + String(p.id),
      productId: String(p.id),
      productName: p.nome,
      categoria: p.categoria || '',
      ingrediente: p.ingrediente || '',
      alvo: p.alvo || '',
      dose: p.dose || '',
      modoAplicacao: p.modoAplicacao || '',
      statusIndicacao:
        p.statusIndicacao || 'Pendente de conferência',
      registro: p.registro || '',
      fonte: p.fonte || '',
      obs: p.obs || '',
      _auto: true
    }));
  }

  // Junta associações salvas e associações antigas do catálogo.
  function associations(fruit) {
    const saved = Array.isArray(fruit.produtosAssociados)
      ? fruit.produtosAssociados
      : [];

    const result = [...saved];

    const seen = new Set(saved.map(a =>
      a.ref ||
      (a.productId
        ? 'p:' + a.productId
        : 'name:' + norm(a.productName))
    ));

    autoAssociations(fruit).forEach(a => {
      if (!seen.has(a.ref)) result.push(a);
    });

    return result;
  }

  function optionList(fruit) {
    const chosen = new Set(
      associations(fruit).map(a =>
        a.ref ||
        (a.productId
          ? 'p:' + a.productId
          : 'name:' + norm(a.productName))
      )
    );

    const options = availableProducts().filter(
      p => !chosen.has(p.ref)
    );

    return '<option value="">Selecione um produto do catálogo ou estoque...</option>' +
      options.map(p =>
        `<option value="${Sitio.esc(p.ref)}">${
          Sitio.esc(p.nome)
        }${
          p.source === 'stock'
            ? ' — somente no estoque'
            : ''
        }</option>`
      ).join('');
  }

  function productBlock(a, fruit) {
    const ref = a.ref ||
      (a.productId
        ? 'p:' + a.productId
        : 'name:' + norm(a.productName));

    const isAuto = !!a._auto;

    const inventory = availableProducts().find(p =>
      p.ref === ref ||
      (a.productId && p.id === String(a.productId)) ||
      norm(p.nome) === norm(a.productName)
    );

    const name =
      a.productName || inventory?.nome || 'Produto sem nome';

    const stockLabel =
      inventory && inventory.estoqueQtd !== null
        ? `<p class="muted">
             <strong>Estoque:</strong>
             ${Sitio.esc(inventory.estoqueQtd)}
             ${Sitio.esc(inventory.estoqueUnidade || '')}
           </p>`
        : '';

    return `
      <article class="item product-association"
        data-fruit-id="${Sitio.esc(fruit.id)}"
        data-assoc-ref="${Sitio.esc(ref)}">

        <h4>
          ${Sitio.esc(name)}
          ${isAuto
            ? '<span class="pill">Associação existente</span>'
            : ''}
        </h4>

        ${stockLabel}

        <label>Finalidade / praga / doença</label>
        <textarea data-assoc-field="alvo" rows="2"
          placeholder="Preencha quando confirmar">${Sitio.esc(
            val(a, 'alvo')
          )}</textarea>

        <div class="two">
          <div>
            <label>Dose conforme rótulo/bula</label>
            <textarea data-assoc-field="dose" rows="2"
              placeholder="Deixe em branco se não confirmou">${Sitio.esc(
                val(a, 'dose')
              )}</textarea>
          </div>

          <div>
            <label>Modo / época / intervalo</label>
            <textarea data-assoc-field="modoAplicacao" rows="2"
              placeholder="Informação de aplicação">${Sitio.esc(
                val(a, 'modoAplicacao')
              )}</textarea>
          </div>
        </div>

        <div class="two">
          <div>
            <label>Situação da informação</label>
            <select data-assoc-field="statusIndicacao">
              ${[
                'Pendente de conferência',
                'Confirmado na bula consultada; conferir versão vigente',
                'Confirmado após conferência da bula vigente',
                'Uso nutricional — conferir rótulo/ficha técnica',
                'Não usar nesta cultura até confirmar autorização'
              ].map(s => `
                <option ${
                  val(a, 'statusIndicacao', 'Pendente de conferência') === s
                    ? 'selected'
                    : ''
                }>${Sitio.esc(s)}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label>Link da bula / fonte</label>
            <input data-assoc-field="fonte" type="url"
              value="${Sitio.esc(val(a, 'fonte'))}"
              placeholder="https://...">
          </div>
        </div>

        <label>Observações</label>
        <textarea data-assoc-field="obs" rows="2"
          placeholder="Notas para esta fruta">${Sitio.esc(
            val(a, 'obs')
          )}</textarea>

        <div class="actions">
          <button type="button"
            data-save-association="${Sitio.esc(ref)}">
            Salvar alterações
          </button>

          <button type="button" class="danger"
            data-remove-association="${Sitio.esc(ref)}">
            Desassociar da fruta
          </button>
        </div>

        <p class="muted">
          A associação não altera nem exclui o cadastro original.
          Confirme a autorização e a dose na bula vigente antes de aplicar.
        </p>
      </article>
    `;
  }

  function render() {
    const q = norm($('filtro').value);

    const list = Sitio.fruits().filter(f =>
      norm([f.nome, f.talhao, f.variedade].join(' ')).includes(q)
    );

    $('lista').innerHTML = list.length
      ? list.map(f => {
          const assoc = associations(f);

          return `
            <article class="item fruit-item">
              <h3>
                ${Sitio.esc(f.nome)}
                ${f.variedade
                  ? ' — ' + Sitio.esc(f.variedade)
                  : ''}
              </h3>

              <div class="muted">
                ${Sitio.esc(f.talhao || 'Sem talhão')}
                • ${Sitio.esc(f.quantidade || 'Quantidade não informada')}
                plantas
                • ${Sitio.esc(f.fase || 'Fase não informada')}
              </div>

              <p>${Sitio.esc(f.obs || 'Sem observações')}</p>

              <h4>Produtos desta fruta</h4>

              ${
                assoc.length
                  ? assoc.map(a => productBlock(a, f)).join('')
                  : '<p class="empty">Nenhum produto associado ainda. Escolha um produto do catálogo ou do estoque abaixo.</p>'
              }

              <section class="card add-product-box">
                <h4>➕ Adicionar produto a ${Sitio.esc(f.nome)}</h4>

                <label>Produto do catálogo ou estoque</label>

                <select data-product-select="${Sitio.esc(f.id)}">
                  ${optionList(f)}
                </select>

                <div class="actions">
                  <button type="button"
                    data-add-product="${Sitio.esc(f.id)}">
                    Adicionar à fruta
                  </button>
                </div>

                <p class="muted">
                  A lista reúne os produtos de “Produtos e defensivos”
                  e os itens que existem somente no “Estoque”.
                  Cadastre o produto e atualize esta página para ele aparecer.
                </p>
              </section>

              <div class="actions">
                <button type="button" class="secondary"
                  data-edit-fruit="${Sitio.esc(f.id)}">
                  Editar cultura
                </button>

                <a class="button secondary"
                  href="busca.html?fruta=${encodeURIComponent(f.id)}">
                  Fotografar/diagnosticar
                </a>

                <a class="button secondary" href="defensivos.html">
                  Produtos e defensivos
                </a>

                <button type="button" class="danger"
                  data-delete-fruit="${Sitio.esc(f.id)}">
                  Excluir cultura
                </button>
              </div>
            </article>
          `;
        }).join('')
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  function findFruit(id) {
    return Sitio.fruits().find(
      f => String(f.id) === String(id)
    );
  }

  function saveAssociationFromCard(card, ref) {
    const fruitId = card.dataset.fruitId;
    const all = Sitio.fruits();
    const index = all.findIndex(
      f => String(f.id) === String(fruitId)
    );

    if (index < 0) return;

    const fruit = all[index];

    const existing = associations(fruit).find(a =>
      (a.ref ||
        (a.productId
          ? 'p:' + a.productId
          : 'name:' + norm(a.productName))) === ref
    );

    if (!existing) return;

    const product = availableProducts().find(p => p.ref === ref);

    const updated = {
      ref,
      productId: product?.source === 'catalog'
        ? product.id
        : (existing.productId || ''),
      stockId: product?.source === 'stock'
        ? product.id
        : (existing.stockId || ''),
      productName: product?.nome || existing.productName || '',
      categoria: product?.categoria || existing.categoria || '',
      ingrediente: product?.ingrediente || existing.ingrediente || '',
      alvo: existing.alvo || '',
      dose: existing.dose || '',
      modoAplicacao: existing.modoAplicacao || '',
      statusIndicacao:
        existing.statusIndicacao || 'Pendente de conferência',
      fonte: existing.fonte || '',
      obs: existing.obs || '',
      registro: existing.registro || ''
    };

    card.querySelectorAll('[data-assoc-field]').forEach(input => {
      updated[input.dataset.assocField] = input.value.trim();
    });

    const saved = Array.isArray(fruit.produtosAssociados)
      ? [...fruit.produtosAssociados]
      : [];

    const pos = saved.findIndex(a =>
      (a.ref ||
        (a.productId
          ? 'p:' + a.productId
          : 'name:' + norm(a.productName))) === ref
    );

    if (pos >= 0) saved[pos] = updated;
    else saved.push(updated);

    all[index] = {
      ...fruit,
      produtosAssociados: saved
    };

    Sitio.set('frutas', all);
    Sitio.flash('Informações do produto salvas para esta fruta.');
    render();
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const list = Sitio.fruits();
    const id = $('id').value || Sitio.id();
    const previous = list.find(
      f => String(f.id) === String(id)
    ) || {};

    const obj = {
      ...previous,
      id,
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
      f => String(f.id) === String(id)
    );

    if (index >= 0) list[index] = obj;
    else list.push(obj);

    Sitio.set('frutas', list);
    clearForm();
    render();
    Sitio.flash('Cultura salva com sucesso.');
  });

  $('limpar').onclick = clearForm;
  $('filtro').oninput = render;

  $('lista').addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;

    // Adicionar produto do catálogo ou do estoque à fruta.
    if (button.dataset.addProduct) {
      const fruit = findFruit(button.dataset.addProduct);
      const select = [...$('lista').querySelectorAll(
        '[data-product-select]'
      )].find(el =>
        el.dataset.productSelect === button.dataset.addProduct
      );

      const ref = select?.value;

      if (!fruit || !ref) {
        Sitio.flash('Selecione um produto primeiro.', 'error');
        return;
      }

      const product = availableProducts().find(p => p.ref === ref);

      if (!product) {
        Sitio.flash(
          'Produto não encontrado. Atualize a página e tente novamente.',
          'error'
        );
        return;
      }

      const all = Sitio.fruits();
      const index = all.findIndex(
        f => String(f.id) === String(fruit.id)
      );

      const saved = Array.isArray(all[index].produtosAssociados)
        ? [...all[index].produtosAssociados]
        : [];

      const already = associations(all[index]).some(a =>
        (a.ref ||
          (a.productId
            ? 'p:' + a.productId
            : 'name:' + norm(a.productName))) === ref
      );

      if (already) {
        Sitio.flash('Esse produto já está associado a esta fruta.', 'error');
        return;
      }

      saved.push({
        ref,
        productId: product.source === 'catalog' ? product.id : '',
        stockId: product.source === 'stock' ? product.id : '',
        productName: product.nome,
        categoria: product.categoria || '',
        ingrediente: product.ingrediente || '',
        alvo: product.alvo || '',
        dose: product.dose || '',
        modoAplicacao: product.modoAplicacao || '',
        statusIndicacao:
          product.statusIndicacao || 'Pendente de conferência',
        registro: product.registro || '',
        fonte: product.fonte || '',
        obs: product.obs || ''
      });

      all[index] = {
        ...all[index],
        produtosAssociados: saved
      };

      Sitio.set('frutas', all);
      render();
      Sitio.flash('Produto associado à fruta.');
      return;
    }

    // Salvar edição dos dados específicos daquela fruta.
    if (button.dataset.saveAssociation) {
      const card = button.closest('.product-association');
      if (card) {
        saveAssociationFromCard(
          card,
          button.dataset.saveAssociation
        );
      }
      return;
    }

    // Desassociar sem apagar o produto do catálogo ou estoque.
    if (button.dataset.removeAssociation) {
      const card = button.closest('.product-association');
      if (!card) return;

      const fruitId = card.dataset.fruitId;
      const ref = button.dataset.removeAssociation;
      const all = Sitio.fruits();

      const index = all.findIndex(
        f => String(f.id) === String(fruitId)
      );

      if (index < 0) return;

      const saved = Array.isArray(all[index].produtosAssociados)
        ? [...all[index].produtosAssociados]
        : [];

      const hasSaved = saved.some(a =>
        (a.ref ||
          (a.productId
            ? 'p:' + a.productId
            : 'name:' + norm(a.productName))) === ref
      );

      if (!hasSaved) {
        Sitio.flash(
          'Esta associação vem do cadastro antigo. Para removê-la, edite as culturas no cadastro do produto.',
          'error'
        );
        return;
      }

      if (!confirm(
        'Desassociar este produto desta fruta? Ele continuará no catálogo e no estoque.'
      )) return;

      all[index] = {
        ...all[index],
        produtosAssociados: saved.filter(a =>
          (a.ref ||
            (a.productId
              ? 'p:' + a.productId
              : 'name:' + norm(a.productName))) !== ref
        )
      };

      Sitio.set('frutas', all);
      render();
      Sitio.flash('Produto desassociado.');
      return;
    }

    // Editar os dados da fruta.
    if (button.dataset.editFruit) {
      const fruit = findFruit(button.dataset.editFruit);
      if (!fruit) return;

      Object.keys(fruit).forEach(k => {
        if ($(k)) $(k).value = fruit[k] ?? '';
      });

      $('id').value = fruit.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Excluir somente o cadastro da fruta.
    if (button.dataset.deleteFruit) {
      const list = Sitio.fruits();
      const index = list.findIndex(
        f => String(f.id) === String(button.dataset.deleteFruit)
      );

      if (index < 0) return;

      if (confirm(
        'Excluir esta cultura? Os registros históricos não serão apagados.'
      )) {
        list.splice(index, 1);
        Sitio.set('frutas', list);
        render();
        Sitio.flash('Cultura excluída.');
      }
    }
  });

  render();
});
