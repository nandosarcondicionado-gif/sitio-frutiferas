Document.addEventListener('DOMContentLoaded', () => {
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
        statusIndicacao: p.statusIndicacao || 'Pendente de conferência',
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

    return [...byName.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

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
      statusIndicacao: p.statusIndicacao || 'Pendente de conferência',
      registro: p.registro || '',
      fonte: p.fonte || '',
      obs: p.obs || '',
      _auto: true
    }));
  }

  function associations(fruit) {
    const saved = Array.isArray(fruit.produtosAssociados) ? fruit.produtosAssociados : [];
    const result = [...saved];
    const seen = new Set(saved.map(a => a.ref || (a.productId ? 'p:' + a.productId : 'name:' + norm(a.productName))));

    autoAssociations(fruit).forEach(a => {
      if (!seen.has(a.ref)) result.push(a);
    });

    return result;
  }

  function optionList(fruit) {
    const chosen = new Set(associations(fruit).map(a => a.ref || (a.productId ? 'p:' + a.productId : 'name:' + norm(a.productName))));
    const options = availableProducts().filter(p => !chosen.has(p.ref));

    return '<option value="">Selecione um produto do catálogo ou estoque...</option>' +
      options.map(p => `<option value="${Sitio.esc(p.ref)}">${Sitio.esc(p.nome)}${p.source === 'stock' ? ' — somente no estoque' : ''}</option>`).join('');
  }

  function productBlock(a, fruit) {
    const ref = a.ref || (a.productId ? 'p:' + a.productId : 'name:' + norm(a.productName));
    const isAuto = !!a._auto;
    const inventory = availableProducts().find(p => p.ref === ref || (a.productId && p.id === String(a.productId)) || norm(p.nome) === norm(a.productName));
    const name = a.productName || inventory?.nome || 'Produto sem nome';

    const stockLabel = inventory && inventory.estoqueQtd !== null
      ? `<p class="muted"><strong>Estoque:</strong> ${Sitio.esc(inventory.estoqueQtd)} ${Sitio.esc(inventory.estoqueUnidade || '')}</p>`
      : '';

    return `
      <article class="item product-association" data-fruit-id="${Sitio.esc(fruit.id)}" data-assoc-ref="${Sitio.esc(ref)}">
        <h4>${Sitio.esc(name)} ${isAuto ? '<span class="pill">Associação existente</span>' : ''}</h4>
        ${stockLabel}
        <label>Finalidade / praga / doença</label>
        <textarea data-assoc-field="alvo" rows="2" placeholder="Preencha quando confirmar">${Sitio.esc(val(a, 'alvo'))}</textarea>
        <div class="two">
          <div>
            <label>Dose conforme rótulo/bula</label>
            <textarea data-assoc-field="dose" rows="2" placeholder="Deixe em branco se não confirmou">${Sitio.esc(val(a, 'dose'))}</textarea>
          </div>
          <div>
            <label>Modo / época / intervalo</label>
            <textarea data-assoc-field="modoAplicacao" rows="2" placeholder="Informação de aplicação">${Sitio.esc(val(a, 'modoAplicacao'))}</textarea>
          </div>
        </div>
        <div class="two">
          <div>
            <label>Situação da informação</label>
            <select data-assoc-field="statusIndicacao">
              ${['Pendente de conferência', 'Confirmado na bula consultada; conferir versão vigente', 'Confirmado após conferência da bula vigente', 'Uso nutricional — conferir rótulo/ficha técnica', 'Não usar nesta cultura até confirmar autorização'].map(s => `
                <option ${val(a, 'statusIndicacao', 'Pendente de conferência') === s ? 'selected' : ''}>${Sitio.esc(s)}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label>Link da bula / fonte</label>
            <input data-assoc-field="fonte" type="url" value="${Sitio.esc(val(a, 'fonte'))}" placeholder="https://...">
          </div>
        </div>
        <label>Observações</label>
        <textarea data-assoc-field="obs" rows="2" placeholder="Notas para esta fruta">${Sitio.esc(val(a, 'obs'))}</textarea>
        <div class="actions">
          <button type="button" data-save-association="${Sitio.esc(ref)}">Salvar alterações</button>
          <button type="button" class="danger" data-remove-association="${Sitio.esc(ref)}">Desassociar da fruta</button>
        </div>
      </article>
    `;
  }

  function render() {
    const q = norm($('filtro').value);
    const list = Sitio.fruits().filter(f => norm([f.nome, f.talhao, f.variedade].join(' ')).includes(q));

    // Exibição em formato de cards principais (clicáveis para abrir detalhes/modal)
    $('lista').innerHTML = list.length
      ? `<div class="fruit-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 15px;">` +
        list.map(f => {
          const assoc = associations(f);
          return `
            <div class="card fruit-card-item" style="cursor: pointer; transition: transform 0.2s;" data-open-modal="${Sitio.esc(f.id)}">
              <h3 style="margin-top: 0; color: #236b36;">🍑 ${Sitio.esc(f.nome)} ${f.variedade ? '— ' + Sitio.esc(f.variedade) : ''}</h3>
              <div class="muted" style="font-size: 0.9rem; margin-bottom: 8px;">
                📍 ${Sitio.esc(f.talhao || 'Sem talhão')} • 🌿 ${Sitio.esc(f.quantidade || '0')} plantas
              </div>
              <p style="font-size: 0.85rem;" class="muted">${Sitio.esc(f.obs || 'Clique para ver produtos e gerenciar.')}</p>
              <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span class="pill" style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${assoc.length} produtos vinculados</span>
                <span style="font-weight: bold; color: #236b36; font-size: 0.9rem;">Gerenciar ➔</span>
              </div>
            </div>
          `;
        }).join('') + `</div>`
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  // Função para abrir o Modal Detalhado de uma Fruta específica
  function openFruitModal(fruitId) {
    const fruit = Sitio.fruits().find(f => String(f.id) === String(fruitId));
    if (!fruit) return;

    const assoc = associations(fruit);
    let modalContainer = $('fruitModalContainer');

    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'fruitModalContainer';
      document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = `
      <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px;">
        <div class="modal-content card" style="background: white; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 8px; position: relative;">
          <button type="button" id="closeModalBtn" style="position: absolute; top: 15px; right: 15px; background: #e0e0e0; border: none; font-size: 1.2rem; cursor: pointer; width: 35px; height: 35px; border-radius: 50%;">✕</button>
          
          <h2 style="color: #236b36; margin-top: 0;">🍇 ${Sitio.esc(fruit.nome)} ${fruit.variedade ? '— ' + Sitio.esc(fruit.variedade) : ''}</h2>
          <div class="muted" style="margin-bottom: 15px;">
            <strong>Talhão:</strong> ${Sitio.esc(fruit.talhao || 'Não informado')} • 
            <strong>Plantas:</strong> ${Sitio.esc(fruit.quantidade || '—')} • 
            <strong>Fase:</strong> ${Sitio.esc(fruit.fase || 'Não informada')}
          </div>
          <p>${Sitio.esc(fruit.obs || 'Sem observações cadastradas.')}</p>

          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">

          <h3>📦 Produtos e Manejos Vinculados</h3>
          ${assoc.length ? assoc.map(a => productBlock(a, fruit)).join('') : '<p class="empty">Nenhum produto associado ainda a esta fruta.</p>'}

          <section class="card add-product-box" style="background: #f9f9f9; margin-top: 20px;">
            <h4>➕ Adicionar produto do Catálogo ou Estoque</h4>
            <label>Selecione o produto</label>
            <select data-product-select="${Sitio.esc(fruit.id)}">
              ${optionList(fruit)}
            </select>
            <div class="actions" style="margin-top: 10px;">
              <button type="button" data-add-product="${Sitio.esc(fruit.id)}">Adicionar à fruta</button>
            </div>
          </section>

          <div class="actions" style="margin-top: 25px; display: flex; gap: 10px;">
            <button type="button" class="secondary" data-edit-fruit="${Sitio.esc(fruit.id)}">Editar dados da cultura</button>
            <button type="button" class="danger" data-delete-fruit="${Sitio.esc(fruit.id)}">Excluir cultura</button>
          </div>
        </div>
      </div>
    `;

    // Fechar modal
    modalContainer.querySelector('#closeModalBtn').onclick = () => {
      modalContainer.innerHTML = '';
    };
    modalContainer.querySelector('.modal-backdrop').onclick = (e) => {
      if (e.target === modalContainer.querySelector('.modal-backdrop')) {
        modalContainer.innerHTML = '';
      }
    };
  }

  function findFruit(id) {
    return Sitio.fruits().find(f => String(f.id) === String(id));
  }

  function saveAssociationFromCard(card, ref) {
    const fruitId = card.dataset.fruitId;
    const all = Sitio.fruits();
    const index = all.findIndex(f => String(f.id) === String(fruitId));
    if (index < 0) return;

    const fruit = all[index];
    const existing = associations(fruit).find(a => (a.ref || (a.productId ? 'p:' + a.productId : 'name:' + norm(a.productName))) === ref);
    if (!existing) return;

    const product = availableProducts().find(p => p.ref === ref);
    const updated = {
      ref,
      productId: product?.source === 'catalog' ? product.id : (existing.productId || ''),
      stockId: product?.source === 'stock' ? product.id : (existing.stockId || ''),
      productName: product?.nome || existing.productName || '',
      categoria: product?.categoria || existing.categoria || '',
      ingrediente: product?.ingrediente || existing.ingrediente || '',
      alvo: existing.alvo || '',
      dose: existing.dose || '',
      modoAplicacao: existing.modoAplicacao || '',
      statusIndicacao: existing.statusIndicacao || 'Pendente de conferência',
      fonte: existing.fonte || '',
      obs: existing.obs || '',
      registro: existing.registro || ''
    };

    card.querySelectorAll('[data-assoc-field]').forEach(input => {
      updated[input.dataset.assocField] = input.value.trim();
    });

    const saved = Array.isArray(fruit.produtosAssociados) ? [...fruit.produtosAssociados] : [];
    const pos = saved.findIndex(a => (a.ref || (a.productId ? 'p:' + a.productId : 'name:' + norm(a.productName))) === ref);

    if (pos >= 0) saved[pos] = updated;
    else saved.push(updated);

    all[index] = { ...fruit, produtosAssociados: saved };
    Sitio.set('frutas', all);
    Sitio.flash('Informações do produto salvas para esta fruta.');
    render();
    openFruitModal(fruitId); // Atualiza o modal aberto
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const list = Sitio.fruits();
    const id = $('id').value || Sitio.id();
    const previous = list.find(f => String(f.id) === String(id)) || {};

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

    const index = list.findIndex(f => String(f.id) === String(id));
    if (index >= 0) list[index] = obj;
    else list.push(obj);

    Sitio.set('frutas', list);
    clearForm();
    render();
    Sitio.flash('Cultura salva com sucesso.');
  });

  $('limpar').onclick = clearForm;
  $('filtro').oninput = render;

  // Delegação de cliques na listagem geral e dentro dos modais abertos
  document.addEventListener('click', e => {
    const fruitCard = e.target.closest('[data-open-modal]');
    if (fruitCard) {
      openFruitModal(fruitCard.dataset.openModal);
      return;
    }

    const button = e.target.closest('button');
    if (!button) return;

    if (button.dataset.addProduct) {
      const fruit = findFruit(button.dataset.addProduct);
      const modal = $('fruitModalContainer');
      const select = modal ? modal.querySelector('[data-product-select]') : null;
      const ref = select?.value;

      if (!fruit || !ref) {
        Sitio.flash('Selecione um produto primeiro.', 'error');
        return;
      }

      const product = availableProducts().find(p => p.ref === ref);
      if (!product) return;

      const all = Sitio.fruits();
      const index = all.findIndex(f => String(f.id) === String(fruit.id));
      const saved = Array.isArray(all[index].produtosAssociados) ? [...all[index].produtosAssociados] : [];

      const already = associations(all[index]).some(a => (a.ref || (a.productId ? 'p:' + a.productId : 'name:' + norm(a.productName))) === ref);
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
        statusIndicacao: product.statusIndicacao || 'Pendente de conferência',
        registro: product.registro || '',
        fonte: product.fonte || '',
        obs: product.obs || ''
      });

      all[index] = { ...all[index], produtosAssociados: saved };
      Sitio.set('frutas', all);
      render();
      openFruitModal(fruit.id);
      Sitio.flash('Produto associado à fruta.');
      return;
    }

    if (button.dataset.saveAssociation) {
      const card = button.closest('.product-association');
      if (card) saveAssociationFromCard(card, button.dataset.saveAssociation);
      return;
    }

    if (button.dataset.removeAssociation) {
      const card = button.closest('.product-association');
      if (!card) return;
      const fruitId = card.dataset.fruitId;
      const ref = button.dataset.removeAssociation;
      const all = Sitio.fruits();
      const index = all.findIndex(f => String(f.id) === String(fruitId));
      if (index < 0) return;

      const saved = Array.isArray(all[index].produtosAssociados) ? [...all[index].produtosAssociados] : [];
      if (!confirm('Desassociar este produto desta fruta? Ele continuará no catálogo e no estoque.')) return;

      all[index] = {
        ...all[index],
        produtosAssociados: saved.filter(a => (a.ref || (a.productId ? 'p:' + a.productId : 'name:' + norm(a.productName))) !== ref)
      };

      Sitio.set('frutas', all);
      render();
      openFruitModal(fruitId);
      Sitio.flash('Produto desassociado.');
      return;
    }

    if (button.dataset.editFruit) {
      const fruit = findFruit(button.dataset.editFruit);
      if (!fruit) return;
      Object.keys(fruit).forEach(k => {
        if ($(k))$(k).value = fruit[k] ?? '';
      });
      $('id').value = fruit.id;
      const modal = $('fruitModalContainer');
      if (modal) modal.innerHTML = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (button.dataset.deleteFruit) {
      const list = Sitio.fruits();
      const index = list.findIndex(f => String(f.id) === String(button.dataset.deleteFruit));
      if (index < 0) return;

      if (confirm('Excluir esta cultura?')) {
        list.splice(index, 1);
        Sitio.set('frutas', list);
        render();
        const modal = $('fruitModalContainer');
        if (modal) modal.innerHTML = '';
        Sitio.flash('Cultura excluída.');
      }
    }
  });

  render();
});
