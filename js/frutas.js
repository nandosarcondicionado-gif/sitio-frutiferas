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

  // Base de dados padrão para injeção automática no sítio
  function seedFrutiferas() {
    let currentFruits = Sitio.fruits();
    if (currentFruits && currentFruits.length > 0) return; // Já existem frutas cadastradas

    const frutasIniciais = [
      {
        id: Sitio.id(),
        nome: 'Pêssego',
        variedade: 'Nectarina / Aurora',
        quantidade: '10',
        talhao: 'Talhão A',
        fase: 'Frutificação',
        obs: 'Atenção para poda de inverno, moscas-das-frutas e ferrugem.',
        produtosAssociados: [
          { ref: 'p:1', productName: 'FLORAFORTE-D', alvo: 'Pegamento de frutos e florada', dose: '100 a 200 mL / 100L de água', modoAplicacao: 'Foliar no pré e pós-florescimento', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' },
          { ref: 'p:3', productName: 'SUPREME AGRO — ÓLEO MINERAL', alvo: 'Cochonilhas e ovos de pragas', dose: '0.5 a 1.0 Litro / 100L de água', modoAplicacao: 'Pulverização na poda de inverno (evitar sol forte)', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:10', productName: 'DECIS 25 EC', alvo: 'Mosca-das-frutas e lagartas', dose: '30 a 50 mL / 100L de água', modoAplicacao: 'Pulverização foliar direta ao notar a praga', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:8', productName: 'AZIMUT SC', alvo: 'Ferrugem do pessegueiro e podridão-parda', dose: '50 a 100 mL / 100L de água', modoAplicacao: 'Preventivo ou nos primeiros sintomas de manchas', statusIndicacao: 'Confirmado na bula consultada; conferir versão vigente' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Goiaba',
        variedade: 'Paluma',
        quantidade: '15',
        talhao: 'Talhão A',
        fase: 'Frutificação',
        obs: 'Monitorar moscas-das-frutas e ferrugem da goiabeira.',
        produtosAssociados: [
          { ref: 'p:10', productName: 'DECIS 25 EC', alvo: 'Mosca-das-frutas e bicho-da-goiaba', dose: '30 a 50 mL / 100L de água', modoAplicacao: 'Pulverização foliar cobrindo bem a copa', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:13', productName: 'BULLDOCK 125 SC', alvo: 'Mosca-das-frutas e percevejos', dose: '10 a 20 mL / 100L de água', modoAplicacao: 'Fase de frutificação', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:7', productName: 'FORTGREEN CaBDry', alvo: 'Firmeza dos frutos e prevenção de podridões', dose: '100 a 200 g / 100L de água', modoAplicacao: 'Foliar no crescimento dos frutos', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Limão',
        variedade: 'Tahiti',
        quantidade: '20',
        talhao: 'Talhão B',
        fase: 'Crescimento / Produção',
        obs: 'Cuidado com o psíllido do citros e verrugose.',
        produtosAssociados: [
          { ref: 'p:9', productName: 'GALIL SC', alvo: 'Psíllido do citros e cochonilhas', dose: '20 a 40 mL / 100L de água', modoAplicacao: 'Na presença de pragas ou fluxo de brotação', statusIndicacao: 'Confirmado na bula consultada; conferir versão vigente' },
          { ref: 'p:3', productName: 'SUPREME AGRO — ÓLEO MINERAL', alvo: 'Cochonilhas e ácaro da falsa ferrugem', dose: '0.5 a 1.0 Litro / 100L de água', modoAplicacao: 'Pulverização no final da tarde', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:5', productName: 'GLUTAMIN K LIBRE', alvo: 'Enchimento de frutos e teor de suco', dose: '150 a 300 mL / 100L de água', modoAplicacao: 'Foliar durante o crescimento das frutas', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Morango',
        variedade: 'San Andreas',
        quantidade: '100',
        talhao: 'Canteiro 1',
        fase: 'Floração / Colheita',
        obs: 'Cultura rasteira. Extrema atenção ao usar herbicidas nas proximidades!',
        produtosAssociados: [
          { ref: 'p:2', productName: 'EXPERTGROW', alvo: 'Bioestimulante para estresse e florada', dose: '50 a 100 mL / 100L de água', modoAplicacao: 'Foliar na pré-florada e fases de calor', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' },
          { ref: 'p:11', productName: 'BELT', alvo: 'Lagartas das folhas e frutos', dose: '7 a 10 mL / 100L de água', modoAplicacao: 'No início do aparecimento das lagartas', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:7', productName: 'FORTGREEN CaBDry', alvo: 'Firmeza e conservação pós-colheita', dose: '100 a 200 g / 100L de água', modoAplicacao: 'Foliar semanal ou quinzenal', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Manga',
        variedade: 'Palmer / Tommy',
        quantidade: '8',
        talhao: 'Talhão A',
        fase: 'Floração',
        obs: 'Atenção especial para Antracnose e Oídio.',
        produtosAssociados: [
          { ref: 'p:12', productName: 'PRIORI XTRA', alvo: 'Antracnose e Oídio da mangueira', dose: '30 a 50 mL / 100L de água', modoAplicacao: 'Preventivo no florescimento e chuvada', statusIndicacao: 'Confirmado na bula consultada; conferir versão vigente' },
          { ref: 'p:5', productName: 'GLUTAMIN K LIBRE', alvo: 'Adoçamento (Brix) e cor do fruto', dose: '150 a 300 mL / 100L de água', modoAplicacao: 'Desenvolvimento do fruto até maturação', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Abacaxi',
        variedade: 'Pérola',
        quantidade: '50',
        talhao: 'Talhão C',
        fase: 'Crescimento',
        obs: 'Não aplicar herbicidas não-seletivos (Herbamov) sobre as plantas.',
        produtosAssociados: [
          { ref: 'p:16', productName: 'HUMIC FLOWER', alvo: 'Enraizamento e condicionamento do solo', dose: '200 a 300 mL / 100L de água', modoAplicacao: 'Rega no pé ou fertirrigação', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' },
          { ref: 'p:1', productName: 'FLORAFORTE-D', alvo: 'Florada e formação da fruta', dose: '100 a 200 mL / 100L de água', modoAplicacao: 'Foliar no olho da planta', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Maçã',
        variedade: 'Eva',
        quantidade: '5',
        talhao: 'Talhão A',
        fase: 'Repouso / Brotação',
        obs: 'Necessita de quebra de dormência e tratamento de inverno.',
        produtosAssociados: [
          { ref: 'p:3', productName: 'SUPREME AGRO — ÓLEO MINERAL', alvo: 'Limpeza de tronco e ovos de pragas', dose: '0.5 a 1.0 Litro / 100L de água', modoAplicacao: 'Poda de inverno', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:8', productName: 'AZIMUT SC', alvo: 'Sarna da macieira e manchas foliares', dose: '50 a 100 mL / 100L de água', modoAplicacao: 'Na brotação e florescimento', statusIndicacao: 'Confirmado na bula consultada; conferir versão vigente' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Cáqui',
        variedade: 'Fuyu',
        quantidade: '6',
        talhao: 'Talhão B',
        fase: 'Crescimento',
        obs: 'Atenção para moscas-das-frutas e antracnose.',
        produtosAssociados: [
          { ref: 'p:10', productName: 'DECIS 25 EC', alvo: 'Mosca-das-frutas e lagartas', dose: '30 a 50 mL / 100L de água', modoAplicacao: 'Fase de crescimento e maturação dos frutos', statusIndicacao: 'Confirmado após conferência da bula vigente' },
          { ref: 'p:5', productName: 'GLUTAMIN K LIBRE', alvo: 'Ganho de tamanho e firmeza do cáqui', dose: '150 a 300 mL / 100L de água', modoAplicacao: 'Foliar na frutificação', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' }
        ]
      },
      {
        id: Sitio.id(),
        nome: 'Lichia',
        variedade: 'Bengal',
        quantidade: '4',
        talhao: 'Talhão B',
        fase: 'Floração',
        obs: 'Atenção para ácaro da falsa erinose e pegamento de frutos.',
        produtosAssociados: [
          { ref: 'p:1', productName: 'FLORAFORTE-D', alvo: 'Evitar queda prematura de frutos e flores', dose: '100 a 200 mL / 100L de água', modoAplicacao: 'Pré e pós-florada', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' },
          { ref: 'p:2', productName: 'EXPERTGROW', alvo: 'Ativação metabólica e pegamento', dose: '50 a 100 mL / 100L de água', modoAplicacao: 'Foliar no início da florada', statusIndicacao: 'Uso nutricional — conferir rótulo/ficha técnica' }
        ]
      }
    ];

    Sitio.set('frutas', frutasIniciais);
  }

  seedFrutiferas();

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
      ? `<p class="muted"><strong>Estoque disponível:</strong> ${Sitio.esc(inventory.estoqueQtd)} ${Sitio.esc(inventory.estoqueUnidade || '')}</p>`
      : '';

    return `
      <article class="item product-association" style="background: #fdfdfd; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; margin-bottom: 15px;" data-fruit-id="${Sitio.esc(fruit.id)}" data-assoc-ref="${Sitio.esc(ref)}">
        <h4 style="margin-top: 0; color: #2e7d32;">
          🧪 ${Sitio.esc(name)}
          ${isAuto ? '<span class="pill" style="font-size: 0.75rem; background: #e0f2f1; color: #00695c; padding: 2px 6px; border-radius: 3px;">Associação automática</span>' : ''}
        </h4>
        ${stockLabel}

        <label style="font-weight: bold;">Finalidade / Alvo (Praga, Doença ou Nutrição):</label>
        <textarea data-assoc-field="alvo" rows="2" placeholder="Ex.: Mosca-das-frutas, Ferrugem, Florada...">${Sitio.esc(val(a, 'alvo'))}</textarea>

        <div class="two" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div>
            <label style="font-weight: bold;">Dose Recomendada:</label>
            <textarea data-assoc-field="dose" rows="2" placeholder="Ex.: 50 mL / 100L de água">${Sitio.esc(val(a, 'dose'))}</textarea>
          </div>
          <div>
            <label style="font-weight: bold;">Modo / Época de Aplicação:</label>
            <textarea data-assoc-field="modoAplicacao" rows="2" placeholder="Ex.: Pulverizar no final da tarde">${Sitio.esc(val(a, 'modoAplicacao'))}</textarea>
          </div>
        </div>

        <div class="two" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div>
            <label style="font-weight: bold;">Situação da Informação:</label>
            <select data-assoc-field="statusIndicacao" style="width: 100%; padding: 6px;">
              ${[
                'Pendente de conferência',
                'Confirmado na bula consultada; conferir versão vigente',
                'Confirmado após conferência da bula vigente',
                'Uso nutricional — conferir rótulo/ficha técnica',
                'Não usar nesta cultura até confirmar autorização'
              ].map(s => `
                <option ${val(a, 'statusIndicacao', 'Pendente de conferência') === s ? 'selected' : ''}>${Sitio.esc(s)}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label style="font-weight: bold;">Link da Bula / Ficha Técnica:</label>
            <input data-assoc-field="fonte" type="url" value="${Sitio.esc(val(a, 'fonte'))}" placeholder="https://...">
          </div>
        </div>

        <div class="actions" style="margin-top: 12px; display: flex; gap: 10px;">
          <button type="button" data-save-association="${Sitio.esc(ref)}">Salvar Alterações</button>
          <button type="button" class="danger" data-remove-association="${Sitio.esc(ref)}">Desassociar da Fruta</button>
        </div>
      </article>
    `;
  }

  function render() {
    const q = norm($('filtro').value);
    const list = Sitio.fruits().filter(f => norm([f.nome, f.talhao, f.variedade].join(' ')).includes(q));

    $('lista').innerHTML = list.length
      ? `<div class="fruit-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">` +
        list.map(f => {
          const assoc = associations(f);
          return `
            <div class="card fruit-card-item" style="cursor: pointer; border: 1px solid #c8e6c9; border-left: 5px solid #236b36; border-radius: 8px; padding: 15px; background: #ffffff; transition: transform 0.2s, box-shadow 0.2s;" data-open-modal="${Sitio.esc(f.id)}">
              <h3 style="margin: 0 0 5px 0; color: #236b36; display: flex; align-items: center; justify-content: space-between;">
                🍑 ${Sitio.esc(f.nome)}
                <span style="font-size: 0.8rem; font-weight: normal; color: #666;">${Sitio.esc(f.fase || '')}</span>
              </h3>
              ${f.variedade ? `<div style="font-size: 0.85rem; color: #555; margin-bottom: 8px;"><strong>Variedade:</strong> ${Sitio.esc(f.variedade)}</div>` : ''}
              <div class="muted" style="font-size: 0.85rem; margin-bottom: 10px;">
                📍 ${Sitio.esc(f.talhao || 'Sem talhão')} • 🌿 ${Sitio.esc(f.quantidade || '0')} plantas
              </div>
              <p style="font-size: 0.85rem; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px;">${Sitio.esc(f.obs || 'Clique para ver detalhes e tratamentos.')}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                <span class="pill" style="background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
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
      <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 15px;">
        <div class="modal-content card" style="background: white; width: 100%; max-width: 850px; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 10px; position: relative; box-shadow: 0 5px 20px rgba(0,0,0,0.3);">
          <button type="button" id="closeModalBtn" style="position: absolute; top: 15px; right: 15px; background: #eeeeee; border: none; font-size: 1.2rem; cursor: pointer; width: 35px; height: 35px; border-radius: 50%; color: #333;">✕</button>
          
          <h2 style="color: #236b36; margin-top: 0; display: flex; align-items: center; gap: 10px;">
            🍇 ${Sitio.esc(fruit.nome)} ${fruit.variedade ? '— ' + Sitio.esc(fruit.variedade) : ''}
          </h2>
          
          <div class="muted" style="margin-bottom: 15px; background: #f5f5f5; padding: 10px; border-radius: 6px; font-size: 0.9rem;">
            📍 <strong>Talhão:</strong> ${Sitio.esc(fruit.talhao || 'Não informado')} | 
            🌿 <strong>Plantas:</strong> ${Sitio.esc(fruit.quantidade || '—')} | 
            🌱 <strong>Fase atual:</strong> ${Sitio.esc(fruit.fase || 'Não informada')}
          </div>
          
          <p style="font-size: 0.95rem; line-height: 1.4;"><strong>Observações do Pomar:</strong> ${Sitio.esc(fruit.obs || 'Sem observações cadastradas.')}</p>

          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">

          <h3 style="color: #1b5e20;">📦 Produtos, Dosagens e Manejos Recomendados</h3>
          ${assoc.length ? assoc.map(a => productBlock(a, fruit)).join('') : '<p class="empty">Nenhum produto associado a esta fruta ainda.</p>'}

          <section class="card add-product-box" style="background: #f9f9f9; border: 1px dashed #236b36; margin-top: 20px; padding: 15px;">
            <h4 style="margin-top: 0;">➕ Vincular Novo Produto do Catálogo ou Estoque</h4>
            <label>Selecione o produto desejado:</label>
            <select data-product-select="${Sitio.esc(fruit.id)}" style="width: 100%; padding: 8px; margin-top: 5px;">
              ${optionList(fruit)}
            </select>
            <div class="actions" style="margin-top: 12px;">
              <button type="button" data-add-product="${Sitio.esc(fruit.id)}">Adicionar Produto à Fruta</button>
            </div>
          </section>

          <div class="actions" style="margin-top: 25px; display: flex; gap: 10px; justify-content: space-between;">
            <div>
              <button type="button" class="secondary" data-edit-fruit="${Sitio.esc(fruit.id)}">Editar Cadastro da Cultura</button>
              <button type="button" class="danger" data-delete-fruit="${Sitio.esc(fruit.id)}">Excluir Cultura</button>
            </div>
            <a class="button secondary" href="busca.html?fruta=${encodeURIComponent(fruit.id)}">📷 Fotografar Sintomas</a>
          </div>
        </div>
      </div>
    `;

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
    openFruitModal(fruitId);
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
