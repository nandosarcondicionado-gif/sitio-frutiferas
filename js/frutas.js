document.addEventListener('DOMContentLoaded', () => {
  try { if (typeof Sitio !== 'undefined' && Sitio.nav) Sitio.nav(); } catch (e) {}
  try { if (typeof Sitio !== 'undefined' && Sitio.seedCatalog) Sitio.seedCatalog(); } catch (e) {}

  const $ = id => document.getElementById(id);
  const form = $('formFruta');

  const norm = s => String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();

  function clearForm() {
    if (form) form.reset();
    if ($('id'))$('id').value = '';
  }

  function getFrutasStorage() {
    try {
      const data = localStorage.getItem('sitio_frutas') || localStorage.getItem('frutas');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return [];
    }
  }

  function setFrutasStorage(frutasList) {
    try {
      localStorage.setItem('sitio_frutas', JSON.stringify(frutasList));
      localStorage.setItem('frutas', JSON.stringify(frutasList));
    } catch (e) {}
  }

  function gerarId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  // Banco de dados com finalidades e alvos padrão para cada produto
  const detalhesProdutosPadrao = {
    'FLORAFORTE-D': { alvo: 'Pegamento de frutos, florada e prevenção de rachaduras', dose: '100 a 200 mL / 100L de água', modoAplicacao: 'Foliar no pré e pós-florescimento' },
    'EXPERTGROW': { alvo: 'Bioestimulante contra estresses hídricos e térmicos', dose: '50 a 100 mL / 100L de água', modoAplicacao: 'Pulverização foliar na pré-florada' },
    'SUPREME AGRO — ÓLEO MINERAL': { alvo: 'Combate a cochonilhas, ácaros e ovos de pragas por asfixia', dose: '0.5 a 1.0 Litro / 100L de água', modoAplicacao: 'Poda de inverno ou final da tarde (evitar sol forte)' },
    'PÉROLA': { alvo: 'Adjuvante espalhante adesivo para melhor absorção', dose: '30 a 60 mL / 100L de água', modoAplicacao: 'Adicionar à calda de pulverização' },
    'GLUTAMIN K LIBRE': { alvo: 'Enchimento, ganho de tamanho e elevação do açúcar (Brix)', dose: '150 a 300 mL / 100L de água', modoAplicacao: 'Foliar do início do fruto até a maturação' },
    'CRYSTAL LAYLAA': { alvo: 'Estimulação do sistema radicular e microbiologia', dose: '100 a 200 mL / 100L de água', modoAplicacao: 'Via foliar ou fertirrigação' },
    'FORTGREEN CaBDry': { alvo: 'Prevenção de podridão estilar e queda de flores', dose: '100 a 200 g / 100L de água', modoAplicacao: 'Foliar na pré e pós-florada' },
    'AZIMUT SC': { alvo: 'Combate ferrugem, oídio, pinta-preta e podridões', dose: '50 a 100 mL / 100L de água', modoAplicacao: 'Preventivo ou nos primeiros sintomas nas folhas' },
    'GALIL SC': { alvo: 'Combate psíllidos, pulgões, cochonilhas e tripes', dose: '20 a 40 mL / 100L de água', modoAplicacao: 'Foliar ao detectar pragas ou brotação nova' },
    'DECIS 25 EC': { alvo: 'Combate rápida lagartas, mosca-das-frutas e besouros', dose: '30 a 50 mL / 100L de água', modoAplicacao: 'Pulverização foliar direta ao notar a praga' },
    'BELT': { alvo: 'Controle seletivo de lagartas de difícil controle', dose: '7 a 10 mL / 100L de água', modoAplicacao: 'Foliar no início da eclosão de lagartas' },
    'PRIORI XTRA': { alvo: 'Fungicida para ferrugens, oídios e antracnose', dose: '30 a 50 mL / 100L de água', modoAplicacao: 'Preventivo na fase vegetativa/florada' },
    'BULLDOCK 125 SC': { alvo: 'Combate mosca-das-frutas, percevejos e tripes', dose: '10 a 20 mL / 100L de água', modoAplicacao: 'Pulverizar na fase de frutificação' },
    'ARTYS (Cletodim)': { alvo: 'Herbicida seletivo para eliminar capins e gramíneas', dose: '45 a 100 mL / 100L de água', modoAplicacao: 'Aplicação dirigida nas entrelinhas (longe das folhas)' },
    'FRENO 240 EC': { alvo: 'Manejo de capins e gramíneas nas entrelinhas', dose: '45 a 100 mL / 100L de água', modoAplicacao: 'Pulverização direcionada no mato jovem' },
    'HUMIC FLOWER': { alvo: 'Condicionador de solo e enraizamento profundo', dose: '200 a 300 mL / 100L de água', modoAplicacao: 'Rega no pé ou fertirrigação' },
    'HERBAMOV': { alvo: 'Herbicida total não-seletivo para limpeza de entrelinhas', dose: '150 a 300 mL / 100L de água', modoAplicacao: 'Estritamente dirigido no mato (nunca atingir as frutíferas)' }
  };

  function listaTodosProdutos() {
    return Object.keys(detalhesProdutosPadrao);
  }

  // Garante que as 9 frutas já venham com seus produtos recomendados e explicações
  function seedFrutiferasObrigatorio() {
    let currentFruits = getFrutasStorage();
    if (currentFruits && currentFruits.length > 0) return;

    const criarProd = (nome) => {
      const info = detalhesProdutosPadrao[nome] || {};
      return {
        productName: nome,
        alvo: info.alvo || '',
        dose: info.dose || '',
        modoAplicacao: info.modoAplicacao || ''
      };
    };

    const frutasIniciais = [
      {
        id: gerarId(),
        nome: 'Pêssego',
        variedade: 'Nectarina / Aurora',
        quantidade: '10',
        talhao: 'Talhão A',
        fase: 'Frutificação',
        obs: 'Atenção para poda de inverno, moscas-das-frutas e ferrugem.',
        produtosAssociados: [
          criarProd('FLORAFORTE-D'),
          criarProd('SUPREME AGRO — ÓLEO MINERAL'),
          criarProd('DECIS 25 EC'),
          criarProd('AZIMUT SC')
        ]
      },
      {
        id: gerarId(),
        nome: 'Goiaba',
        variedade: 'Paluma',
        quantidade: '15',
        talhao: 'Talhão A',
        fase: 'Frutificação',
        obs: 'Monitorar moscas-das-frutas e ferrugem.',
        produtosAssociados: [
          criarProd('DECIS 25 EC'),
          criarProd('BULLDOCK 125 SC'),
          criarProd('FORTGREEN CaBDry')
        ]
      },
      {
        id: gerarId(),
        nome: 'Limão',
        variedade: 'Tahiti',
        quantidade: '20',
        talhao: 'Talhão B',
        fase: 'Crescimento',
        obs: 'Cuidado com o psíllido do citros.',
        produtosAssociados: [
          criarProd('GALIL SC'),
          criarProd('SUPREME AGRO — ÓLEO MINERAL'),
          criarProd('GLUTAMIN K LIBRE')
        ]
      },
      {
        id: gerarId(),
        nome: 'Morango',
        variedade: 'San Andreas',
        quantidade: '100',
        talhao: 'Canteiro 1',
        fase: 'Floração',
        obs: 'Cuidado com herbicidas nas proximidades!',
        produtosAssociados: [
          criarProd('EXPERTGROW'),
          criarProd('BELT'),
          criarProd('FORTGREEN CaBDry')
        ]
      },
      {
        id: gerarId(),
        nome: 'Manga',
        variedade: 'Palmer / Tommy',
        quantidade: '8',
        talhao: 'Talhão A',
        fase: 'Floração',
        obs: 'Atenção para Antracnose.',
        produtosAssociados: [
          criarProd('PRIORI XTRA'),
          criarProd('GLUTAMIN K LIBRE')
        ]
      },
      {
        id: gerarId(),
        nome: 'Abacaxi',
        variedade: 'Pérola',
        quantidade: '50',
        talhao: 'Talhão C',
        fase: 'Crescimento',
        obs: 'Evitar herbicida total nas folhas.',
        produtosAssociados: [
          criarProd('HUMIC FLOWER'),
          criarProd('FLORAFORTE-D')
        ]
      },
      {
        id: gerarId(),
        nome: 'Maçã',
        variedade: 'Eva',
        quantidade: '5',
        talhao: 'Talhão A',
        fase: 'Repouso',
        obs: 'Tratamento de inverno.',
        produtosAssociados: [
          criarProd('SUPREME AGRO — ÓLEO MINERAL'),
          criarProd('AZIMUT SC')
        ]
      },
      {
        id: gerarId(),
        nome: 'Cáqui',
        variedade: 'Fuyu',
        quantidade: '6',
        talhao: 'Talhão B',
        fase: 'Crescimento',
        obs: 'Monitorar moscas-das-frutas.',
        produtosAssociados: [
          criarProd('DECIS 25 EC'),
          criarProd('GLUTAMIN K LIBRE')
        ]
      },
      {
        id: gerarId(),
        nome: 'Lichia',
        variedade: 'Bengal',
        quantidade: '4',
        talhao: 'Talhão B',
        fase: 'Floração',
        obs: 'Prevenção de queda de frutos.',
        produtosAssociados: [
          criarProd('FLORAFORTE-D'),
          criarProd('EXPERTGROW')
        ]
      }
    ];

    setFrutasStorage(frutasIniciais);
  }

  seedFrutiferasObrigatorio();

  function getFrutasAtuais() {
    return getFrutasStorage() || [];
  }

  function salvarFrutasAtuais(lista) {
    if (typeof Sitio !== 'undefined' && Sitio.set) {
      Sitio.set('frutas', lista);
    }
    setFrutasStorage(lista);
  }

  function productBlock(a, fruit) {
    const name = a.productName || 'Produto';
    return `
      <article class="item product-association" style="background: #fdfdfd; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 15px;" data-fruit-id="${fruit.id}" data-product-name="${encodeURIComponent(name)}">
        <h4 style="margin-top: 0; color: #2e7d32;">🧪 ${escapeHtml(name)}</h4>
        
        <label style="font-weight: bold;">Finalidade / Alvo:</label>
        <textarea data-assoc-field="alvo" rows="2">${escapeHtml(a.alvo || '')}</textarea>

        <div class="two" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div>
            <label style="font-weight: bold;">Dose:</label>
            <textarea data-assoc-field="dose" rows="2">${escapeHtml(a.dose || '')}</textarea>
          </div>
          <div>
            <label style="font-weight: bold;">Modo de Aplicação:</label>
            <textarea data-assoc-field="modoAplicacao" rows="2">${escapeHtml(a.modoAplicacao || '')}</textarea>
          </div>
        </div>

        <div class="actions" style="margin-top: 12px; display: flex; gap: 10px;">
          <button type="button" data-save-assoc="${escapeHtml(name)}">Salvar Alterações</button>
          <button type="button" class="danger" data-remove-assoc="${escapeHtml(name)}">Remover</button>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function render() {
    const filtroEl = $('filtro');
    const q = filtroEl ? norm(filtroEl.value) : '';
    const list = getFrutasAtuais().filter(f => norm([f.nome, f.talhao, f.variedade].join(' ')).includes(q));

    const listaEl = $('lista');
    if (!listaEl) return;

    listaEl.innerHTML = list.length
      ? `<div class="fruit-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">` +
        list.map(f => {
          const assoc = f.produtosAssociados || [];
          return `
            <div class="card fruit-card-item" style="cursor: pointer; border: 1px solid #c8e6c9; border-left: 5px solid #236b36; border-radius: 8px; padding: 15px; background: #ffffff;" data-open-modal="${f.id}">
              <h3 style="margin: 0 0 5px 0; color: #236b36; display: flex; align-items: center; justify-content: space-between;">
                🍑 ${escapeHtml(f.nome)}
                <span style="font-size: 0.8rem; font-weight: normal; color: #666;">${escapeHtml(f.fase || '')}</span>
              </h3>
              ${f.variedade ? `<div style="font-size: 0.85rem; color: #555; margin-bottom: 8px;"><strong>Variedade:</strong> ${escapeHtml(f.variedade)}</div>` : ''}
              <div class="muted" style="font-size: 0.85rem; margin-bottom: 10px;">
                📍 ${escapeHtml(f.talhao || 'Sem talhão')} • 🌿 ${escapeHtml(f.quantidade || '0')} plantas
              </div>
              <p style="font-size: 0.85rem; color: #666; margin-bottom: 12px;">${escapeHtml(f.obs || 'Clique para ver tratamentos.')}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                  💊 ${assoc.length} produtos
                </span>
                <span style="font-weight: bold; color: #236b36; font-size: 0.85rem;">Abrir Fruta ➔</span>
              </div>
            </div>
          `;
        }).join('') + `</div>`
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  function openFruitModal(fruitId) {
    const fruit = getFrutasAtuais().find(f => String(f.id) === String(fruitId));
    if (!fruit) return;

    const assoc = fruit.produtosAssociados || [];
    const jaTem = new Set(assoc.map(p => p.productName));
    const produtosDisponiveis = listaTodosProdutos().filter(p => !jaTem.has(p));

    let modalContainer = $('fruitModalContainer');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'fruitModalContainer';
      document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = `
      <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 15px;">
        <div class="modal-content card" style="background: white; width: 100%; max-width: 850px; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 10px; position: relative; box-shadow: 0 5px 20px rgba(0,0,0,0.3);">
          <button type="button" id="closeModalBtn" style="position: absolute; top: 15px; right: 15px; background: #eeeeee; border: none; font-size: 1.2rem; cursor: pointer; width: 35px; height: 35px; border-radius: 50%; color: #333;">✕</button>
          
          <h2 style="color: #236b36; margin-top: 0;">🍇 ${escapeHtml(fruit.nome)} ${fruit.variedade ? '— ' + escapeHtml(fruit.variedade) : ''}</h2>
          
          <div class="muted" style="margin-bottom: 15px; background: #f5f5f5; padding: 10px; border-radius: 6px; font-size: 0.9rem;">
            📍 <strong>Talhão:</strong> ${escapeHtml(fruit.talhao || 'Não informado')} | 
            🌿 <strong>Plantas:</strong> ${escapeHtml(fruit.quantidade || '—')} | 
            🌱 <strong>Fase:</strong> ${escapeHtml(fruit.fase || 'Não informada')}
          </div>
          
          <p style="font-size: 0.95rem;"><strong>Observações:</strong> ${escapeHtml(fruit.obs || 'Sem observações.')}</p>

          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">

          <h3 style="color: #1b5e20;">📦 Produtos, Dosagens e Manejos</h3>
          ${assoc.length ? assoc.map(a => productBlock(a, fruit)).join('') : '<p class="empty">Nenhum produto associado.</p>'}

          <section class="card add-product-box" style="background: #f9f9f9; border: 1px dashed #236b36; margin-top: 20px; padding: 15px;" data-fruit-id="${fruit.id}">
            <h4 style="margin-top: 0;">➕ Adicionar Produto à Fruta</h4>
            <select id="selectNovoProduto" style="width: 100%; padding: 8px; margin-top: 5px;">
              <option value="">Selecione um produto da lista...</option>
              ${produtosDisponiveis.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('')}
            </select>
            <div class="actions" style="margin-top: 12px;">
              <button type="button" data-add-assoc="${fruit.id}">Vincular Produto</button>
            </div>
          </section>

          <div class="actions" style="margin-top: 25px; display: flex; gap: 10px; justify-content: space-between;">
            <div>
              <button type="button" class="secondary" data-edit-fruit="${escapeHtml(fruit.id)}">✏️ Editar Cultura</button>
              <button type="button" class="danger" data-delete-fruit="${escapeHtml(fruit.id)}">🗑️ Excluir Cultura</button>
            </div>
          </div>
        </div>
      </div>
    `;

    modalContainer.querySelector('#closeModalBtn').onclick = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('.modal-backdrop').onclick = (e) => {
      if (e.target === modalContainer.querySelector('.modal-backdrop')) { modalContainer.innerHTML = ''; }
    };
  }

  document.addEventListener('click', e => {
    const fruitCard = e.target.closest('[data-open-modal]');
    if (fruitCard) {
      openFruitModal(fruitCard.dataset.openModal);
      return;
    }

    const button = e.target.closest('button');
    if (!button) return;

    if (button.dataset.deleteFruit) {
      if (!confirm('Deseja excluir esta cultura?')) return;
      let list = getFrutasAtuais().filter(f => String(f.id) !== String(button.dataset.deleteFruit));
      salvarFrutasAtuais(list);
      render();
      const modal = $('fruitModalContainer');
      if (modal) modal.innerHTML = '';
      if (typeof Sitio !== 'undefined' && Sitio.flash) Sitio.flash('Cultura excluída.');
      return;
    }

    if (button.dataset.editFruit) {
      const fruitId = button.dataset.editFruit;
      const fruit = getFrutasAtuais().find(f => String(f.id) === String(fruitId));
      if (!fruit) return;

      if ($('id'))$('id').value = fruit.id;
      if ($('nome'))$('nome').value = fruit.nome || '';
      if ($('variedade'))$('variedade').value = fruit.variedade || '';
      if ($('quantidade'))$('quantidade').value = fruit.quantidade || '';
      if ($('talhao'))$('talhao').value = fruit.talhao || '';
      if ($('idade'))$('idade').value = fruit.idade || '';
      if ($('fase'))$('fase').value = fruit.fase || '';
      if ($('obs'))$('obs').value = fruit.obs || '';

      const modal = $('fruitModalContainer');
      if (modal) modal.innerHTML = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof Sitio !== 'undefined' && Sitio.flash) Sitio.flash('Modo de edição ativado no formulário acima.');
      return;
    }

    if (button.dataset.addAssoc) {
      const fruitId = button.dataset.addAssoc;
      const select = $('selectNovoProduto');
      const nomeProd = select ? select.value : '';
      if (!nomeProd) {
        alert('Selecione um produto.');
        return;
      }

      let list = getFrutasAtuais();
      let fruitIndex = list.findIndex(f => String(f.id) === String(fruitId));
      if (fruitIndex < 0) return;

      if (!list[fruitIndex].produtosAssociados) list[fruitIndex].produtosAssociados = [];
      
      // Puxa automaticamente a finalidade padrão se existir
      const infoPadrao = detalhesProdutosPadrao[nomeProd] || {};
      list[fruitIndex].produtosAssociados.push({
        productName: nomeProd,
        alvo: infoPadrao.alvo || '',
        dose: infoPadrao.dose || '',
        modoAplicacao: infoPadrao.modoAplicacao || ''
      });

      salvarFrutasAtuais(list);
      render();
      openFruitModal(fruitId);
      if (typeof Sitio !== 'undefined' && Sitio.flash) Sitio.flash('Produto adicionado!');
      return;
    }

    if (button.dataset.saveAssoc) {
      const article = button.closest('.product-association');
      if (!article) return;
      const fruitId = article.dataset.fruitId;
      const prodName = decodeURIComponent(article.dataset.productName);

      let list = getFrutasAtuais();
      let fruitIndex = list.findIndex(f => String(f.id) === String(fruitId));
      if (fruitIndex < 0) return;

      let produtos = list[fruitIndex].produtosAssociados || [];
      let prodIndex = produtos.findIndex(p => p.productName === prodName);
      if (prodIndex >= 0) {
        article.querySelectorAll('[data-assoc-field]').forEach(input => {
          produtos[prodIndex][input.dataset.assocField] = input.value.trim();
        });
        list[fruitIndex].produtosAssociados = produtos;
        salvarFrutasAtuais(list);
        if (typeof Sitio !== 'undefined' && Sitio.flash) Sitio.flash('Alterações salvas!');
        openFruitModal(fruitId);
      }
      return;
    }

    if (button.dataset.removeAssoc) {
      const article = button.closest('.product-association');
      if (!article) return;
      const fruitId = article.dataset.fruitId;
      const prodName = decodeURIComponent(article.dataset.productName);

      if (!confirm('Remover este produto da fruta?')) return;
      let list = getFrutasAtuais();
      let fruitIndex = list.reset ? -1 : list.findIndex(f => String(f.id) === String(fruitId));
      if (fruitIndex < 0) {
        fruitIndex = list.findIndex(f => String(f.id) === String(fruitId));
      }
      if (fruitIndex < 0) return;

      list[fruitIndex].produtosAssociados = (list[fruitIndex].produtosAssociados || []).filter(p => p.productName !== prodName);
      salvarFrutasAtuais(list);
      render();
      openFruitModal(fruitId);
      return;
    }
  });

  if ($('filtro')) {$('filtro').oninput = render;
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let list = getFrutasAtuais();
      const id = $('id') && $('id').value ? $('id').value : gerarId();
      const existingIndex = list.findIndex(f => String(f.id) === String(id));

      const obj = {
        id,
        nome: $('nome') ?$('nome').value.trim() : '',
        variedade: $('variedade') ?$('variedade').value.trim() : '',
        quantidade: $('quantidade') ?$('quantidade').value : '',
        talhao: $('talhao') ?$('talhao').value.trim() : '',
        idade: $('idade') ?$('idade').value.trim() : '',
        fase: $('fase') ?$('fase').value : '',
        obs: $('obs') ?$('obs').value.trim() : '',
        produtosAssociados: existingIndex >= 0 ? (list[existingIndex].produtosAssociados || []) : []
      };

      if (!obj.nome) return;

      if (existingIndex >= 0) {
        list[existingIndex] = obj;
      } else {
        list.push(obj);
      }

      salvarFrutasAtuais(list);
      clearForm();
      render();
      if (typeof Sitio !== 'undefined' && Sitio.flash) Sitio.flash('Cultura salva com sucesso!');
    });
  }

  if ($('limpar')) {$('limpar').onclick = clearForm;
  }

  render();
});
