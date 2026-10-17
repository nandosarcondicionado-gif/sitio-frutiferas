document.addEventListener('DOMContentLoaded', () => {
  // Tenta inicializar as funções globais do app se existirem
  try { if (typeof Sitio !== 'undefined' && Sitio.nav) Sitio.nav(); } catch (e) {}
  try { if (typeof Sitio !== 'undefined' && Sitio.seedCatalog) Sitio.seedCatalog(); } catch (e) {}

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
    if (form) form.reset();
    if ($('id'))$('id').value = '';
  }

  // Funções de manipulação do LocalStorage seguras
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

  // Garantir ID único seguro
  function gerarId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cadastra as frutas padrão se estiver vazio
  function seedFrutiferasObrigatorio() {
    let currentFruits = getFrutasStorage();
    if (currentFruits && currentFruits.length > 0) return;

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
          { productName: 'FLORAFORTE-D', alvo: 'Pegamento de frutos e florada', dose: '100 a 200 mL / 100L', modoAplicacao: 'Foliar no pré e pós-florescimento' },
          { productName: 'SUPREME AGRO — ÓLEO MINERAL', alvo: 'Cochonilhas e ovos de pragas', dose: '0.5 a 1.0 L / 100L', modoAplicacao: 'Poda de inverno (evitar sol forte)' },
          { productName: 'DECIS 25 EC', alvo: 'Mosca-das-frutas e lagartas', dose: '30 a 50 mL / 100L', modoAplicacao: 'Pulverização foliar direta' },
          { productName: 'AZIMUT SC', alvo: 'Ferrugem e podridão-parda', dose: '50 a 100 mL / 100L', modoAplicacao: 'Preventivo nas folhas' }
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
          { productName: 'DECIS 25 EC', alvo: 'Mosca-das-frutas', dose: '30 a 50 mL / 100L', modoAplicacao: 'Pulverização na copa' },
          { productName: 'BULLDOCK 125 SC', alvo: 'Percevejos e moscas', dose: '10 a 20 mL / 100L', modoAplicacao: 'Fase de frutificação' },
          { productName: 'FORTGREEN CaBDry', alvo: 'Firmeza dos frutos', dose: '100 a 200 g / 100L', modoAplicacao: 'Foliar no crescimento' }
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
          { productName: 'GALIL SC', alvo: 'Psíllido e cochonilhas', dose: '20 a 40 mL / 100L', modoAplicacao: 'Fluxo de brotação' },
          { productName: 'SUPREME AGRO — ÓLEO MINERAL', alvo: 'Ácaros e cochonilhas', dose: '0.5 a 1.0 L / 100L', modoAplicacao: 'Final da tarde' },
          { productName: 'GLUTAMIN K LIBRE', alvo: 'Enchimento de frutos', dose: '150 a 300 mL / 100L', modoAplicacao: 'Foliar' }
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
          { productName: 'EXPERTGROW', alvo: 'Bioestimulante e florada', dose: '50 a 100 mL / 100L', modoAplicacao: 'Pré-florada' },
          { productName: 'BELT', alvo: 'Lagartas', dose: '7 a 10 mL / 100L', modoAplicacao: 'Início de infestação' },
          { productName: 'FORTGREEN CaBDry', alvo: 'Firmeza pós-colheita', dose: '100 a 200 g / 100L', modoAplicacao: 'Foliar quinzenal' }
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
          { productName: 'PRIORI XTRA', alvo: 'Antracnose e Oídio', dose: '30 a 50 mL / 100L', modoAplicacao: 'Preventivo no florescimento' },
          { productName: 'GLUTAMIN K LIBRE', alvo: 'Adoçamento e cor', dose: '150 a 300 mL / 100L', modoAplicacao: 'Desenvolvimento' }
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
          { productName: 'HUMIC FLOWER', alvo: 'Enraizamento', dose: '200 a 300 mL / 100L', modoAplicacao: 'Rega no pé' },
          { productName: 'FLORAFORTE-D', alvo: 'Formação da fruta', dose: '100 a 200 mL / 100L', modoAplicacao: 'Foliar no olho' }
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
          { productName: 'SUPREME AGRO — ÓLEO MINERAL', alvo: 'Ovos de pragas', dose: '0.5 a 1.0 L / 100L', modoAplicacao: 'Poda de inverno' },
          { productName: 'AZIMUT SC', alvo: 'Sarna e manchas', dose: '50 a 100 mL / 100L', modoAplicacao: 'Brotação' }
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
          { productName: 'DECIS 25 EC', alvo: 'Mosca-das-frutas', dose: '30 a 50 mL / 100L', modoAplicacao: 'Frutificação' },
          { productName: 'GLUTAMIN K LIBRE', alvo: 'Tamanho e firmeza', dose: '150 a 300 mL / 100L', modoAplicacao: 'Foliar' }
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
          { productName: 'FLORAFORTE-D', alvo: 'Fixação de flores', dose: '100 a 200 mL / 100L', modoAplicacao: 'Pré-florada' }
        ]
      }
    ];

    setFrutasStorage(frutasIniciais);
  }

  seedFrutiferasObrigatorio();

  function getFrutasAtuais() {
    // Compatibilidade com o objeto Sitio se existir, senão usa o localStorage direto
    if (typeof Sitio !== 'undefined' && Sitio.fruits && typeof Sitio.fruits === 'function') {
      const f = Sitio.fruits();
      if (f && f.length > 0) return f;
    }
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

          <h3 style="color: #1b5e20;">📦 Produtos e Dosagens</h3>
          ${assoc.length ? assoc.map(a => productBlock(a, fruit)).join('') : '<p class="empty">Nenhum produto associado.</p>'}

          <div class="actions" style="margin-top: 25px; display: flex; gap: 10px;">
            <button type="button" class="danger" data-delete-fruit="${escapeHtml(fruit.id)}">Excluir Cultura</button>
          </div>
        </div>
      </div>
    `;

    modalContainer.querySelector('#closeModalBtn').onclick = () => { modalContainer.innerHTML = ''; };
    modalContainer.querySelector('.modal-backdrop').onclick = (e) => {
      if (e.target === modalContainer.querySelector('.modal-backdrop')) { modalContainer.innerHTML = ''; }
    };
  }

  // Eventos de clique globais
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
      let fruitIndex = list.findIndex(f => String(f.id) === String(fruitId));
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

  // Renderiza imediatamente ao carregar
  render();
});
