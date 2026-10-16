/* Sítio Frutíferas — funções comuns e dados locais. */
(function () {
  'use strict';

  const KEYS = {
    frutas: 'sf_frutas',
    produtos: 'sf_produtos',
    estoque: 'sf_estoque',
    aplicacoes: 'sf_aplicacoes',
    diagnosticos: 'sf_diagnosticos',
    config: 'sf_config',
    movimentos: 'sf_movimentos'
  };

  const oldKeys = {
    frutas: ['frutas'],
    produtos: ['defensivos', 'produtos'],
    estoque: ['estoque'],
    aplicacoes: ['historico', 'aplicacoes'],
    diagnosticos: ['diagnosticos'],
    config: ['sf_config'],
    movimentos: ['movimentos']
  };

  const CATALOG_SEED_KEY = 'sf_catalog_seeded_v3';

  function parse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function get(key, fallback = []) {
    const storageKey = KEYS[key];
    if (!storageKey) return fallback;

    const raw = localStorage.getItem(storageKey);
    if (raw !== null) return parse(raw, fallback);

    for (const oldKey of (oldKeys[key] || [])) {
      const legacy = localStorage.getItem(oldKey);
      if (legacy !== null) {
        const value = parse(legacy, fallback);
        localStorage.setItem(storageKey, JSON.stringify(value));
        return value;
      }
    }

    return fallback;
  }

  function set(key, value) {
    if (!KEYS[key]) throw new Error('Chave de armazenamento inválida: ' + key);
    localStorage.setItem(KEYS[key], JSON.stringify(value));
    return value;
  }

  function id() {
    return window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sf-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function esc(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function dateNow() {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function fmtDate(value) {
    if (!value) return 'Sem data';
    const d = new Date(value + 'T12:00:00');
    return Number.isNaN(d.getTime())
      ? esc(value)
      : d.toLocaleDateString('pt-BR');
  }

  function flash(message, type = 'success') {
    let el = document.getElementById('mensagem-global');

    if (!el) {
      el = document.createElement('div');
      el.id = 'mensagem-global';
      el.setAttribute('role', 'status');
      document.querySelector('.wrap')?.prepend(el);
    }

    el.className = 'notice ' + (type === 'error' ? 'error' : 'success');
    el.textContent = message;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function nav() {
    const el = document.getElementById('nav');
    if (!el) return;

    const links = [
      ['../index.html', '🏡 Início'],
      ['frutas.html', '🌱 Minhas frutas'],
      ['busca.html', '📷 Foto e diagnóstico'],
      ['problemas.html', '🔎 Guia de problemas'],
      ['defensivos.html', '🧪 Produtos'],
      ['estoque.html', '📦 Estoque'],
      ['aplicacao.html', '📝 Aplicações'],
      ['historico.html', '📋 Histórico'],
      ['ajuda.html', '❓ Ajuda']
    ];

    el.innerHTML = links
      .map(([url, title]) => `<a href="${url}">${title}</a>`)
      .join('');
  }

  function navHome() {
    const el = document.getElementById('nav');
    if (!el) return;

    const links = [
      ['paginas/frutas.html', '🌱 Minhas frutas'],
      ['paginas/busca.html', '📷 Foto e diagnóstico'],
      ['paginas/problemas.html', '🔎 Guia de problemas'],
      ['paginas/defensivos.html', '🧪 Produtos'],
      ['paginas/estoque.html', '📦 Estoque'],
      ['paginas/aplicacao.html', '📝 Registrar aplicação'],
      ['paginas/historico.html', '📋 Histórico'],
      ['paginas/ajuda.html', '❓ Ajuda']
    ];

    el.innerHTML = links
      .map(([url, title]) => `<a href="${url}">${title}</a>`)
      .join('');
  }

  const CULTURAS = [
    'Pêssego', 'Morango', 'Abacaxi', 'Limão', 'Lichia',
    'Maçã', 'Cáqui', 'Manga', 'Goiaba'
  ];

  function fruits() {
    let list = get('frutas', []);
    if (!Array.isArray(list)) list = [];

    let changed = false;

    for (const nome of CULTURAS) {
      const exists = list.some(item =>
        String(item.nome || '').trim().toLocaleLowerCase('pt-BR') ===
        nome.toLocaleLowerCase('pt-BR')
      );

      if (!exists) {
        list.push({
          id: id(),
          nome,
          variedade: '',
          quantidade: '',
          idade: '',
          talhao: '',
          fase: '',
          obs: ''
        });
        changed = true;
      }
    }

    if (changed || localStorage.getItem(KEYS.frutas) === null) {
      set('frutas', list);
    }

    return list;
  }

  /*
   * As indicações abaixo são cadastradas como pendentes quando não existe
   * confirmação da bula vigente para a formulação, cultura e alvo exatos.
   * Não preencher doses por suposição.
   */
  const CATALOG = [
    {
      name: 'FLORAFORTE-D',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar no rótulo',
      alvo: 'Finalidade não confirmada apenas pelo nome comercial.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Consultar fabricante e rótulo'
    },
    {
      name: 'EXPERTGROW',
      categoria: 'Bioestimulante',
      ingrediente: 'Composição a confirmar no rótulo',
      alvo: 'Conferir finalidade, culturas e modo de uso na ficha técnica.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Ficha técnica do fabricante'
    },
    {
      name: 'SUPREME AGRO — ÓLEO MINERAL',
      categoria: 'Adjuvante',
      ingrediente: 'Óleo mineral; composição exata a confirmar',
      alvo: 'Confirmar finalidade, compatibilidade e autorização antes do uso.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Rótulo e ficha técnica'
    },
    {
      name: 'PÉROLA',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar',
      alvo: 'Finalidade não confirmada apenas pelo nome comercial.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Confirmar fabricante e rótulo'
    },
    {
      name: 'GLUTAMIN K LIBRE',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar',
      alvo: 'Finalidade não confirmada apenas pelo nome comercial.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Confirmar fabricante e rótulo'
    },
    {
      name: 'CRYSTAL LAYLAA',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar',
      alvo: 'Finalidade não confirmada apenas pelo nome comercial.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Confirmar fabricante e rótulo'
    },
    {
      name: 'FORTGREEN CaBDry',
      categoria: 'Fertilizante',
      ingrediente: 'Composição nutricional exata a confirmar',
      alvo: 'Conferir garantias nutricionais, culturas e modo de aplicação.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Ficha técnica do fabricante'
    },
    {
      name: 'AZIMUT SC',
      categoria: 'Classificação a confirmar',
      ingrediente: 'Ingrediente ativo e formulação a confirmar',
      alvo: 'Não definir cultura ou dose sem confirmar o registro e a bula exata.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Consultar AGROFIT'
    },
    {
      name: 'GALIL SC',
      categoria: 'Defensivo',
      ingrediente: 'Confirmar composição no rótulo vigente',
      alvo: 'Confirmar culturas e alvos autorizados para a formulação exata.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência para as nove frutíferas',
      fonte: 'https://www.adama.com/brasil/pt/protecao-de-cultivos/inseticidas/galilsc',
      registro: 'Confirmar na embalagem e no AGROFIT'
    },
    {
      name: 'DECIS 25 EC',
      categoria: 'Defensivo',
      ingrediente: 'Deltametrina 25 g/L — confirmar no rótulo',
      alvo: 'Inseticida. A indicação depende da cultura e do alvo descritos na bula vigente.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: 'https://agrofit.agricultura.gov.br/',
      registro: 'Confirmar registro vigente no AGROFIT'
    },
    {
      name: 'BELT',
      categoria: 'Defensivo',
      ingrediente: 'Ingrediente ativo e formulação exatos a confirmar',
      alvo: 'Confirmar culturas, alvos, dose e intervalo de segurança na bula vigente.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Consultar AGROFIT'
    },
    {
      name: 'PRIORI XTRA',
      categoria: 'Defensivo',
      ingrediente: 'Confirmar composição e formulação no rótulo vigente',
      alvo: 'Fungicida. Confirmar a indicação específica por cultura e doença.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência para as nove frutíferas',
      fonte: 'https://portal.syngenta.com.br/produtos/priori-xtra/',
      registro: 'Confirmar no AGROFIT'
    },
    {
      name: 'BULLDOCK 125 SC',
      categoria: 'Defensivo',
      ingrediente: 'Beta-ciflutrina — confirmar concentração e formulação no rótulo',
      alvo: 'Inseticida. Confirmar cultura e alvo na bula vigente antes de registrar indicação.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: 'https://agrofit.agricultura.gov.br/',
      registro: 'Confirmar registro vigente no AGROFIT'
    },
    {
      name: 'ARTYS (Cletodim)',
      categoria: 'Defensivo',
      ingrediente: 'Cletodim informado pelo usuário; marca/formulação a confirmar',
      alvo: 'Herbicida para situações específicas. Não aplicar no pomar sem autorização expressa na bula.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Confirmar nome comercial e registro'
    },
    {
      name: 'FRENO 240 EC',
      categoria: 'Classificação a confirmar',
      ingrediente: 'Ingrediente ativo e categoria a confirmar',
      alvo: 'Não inferir composição apenas pelo nome comercial.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Consultar AGROFIT e rótulo'
    },
    {
      name: 'HUMIC FLOWER',
      categoria: 'Fertilizante',
      ingrediente: 'Composição a confirmar',
      alvo: 'Confirmar composição, culturas, dose e via de aplicação na ficha técnica.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Ficha técnica do fabricante'
    },
    {
      name: 'HERBAMOV',
      categoria: 'Classificação a confirmar',
      ingrediente: 'Ingrediente ativo e categoria a confirmar',
      alvo: 'Não inferir composição apenas pelo nome comercial.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Consultar AGROFIT e rótulo'
    }
  ];

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  function seedCatalog() {
    let productsList = get('produtos', []);
    if (!Array.isArray(productsList)) productsList = [];

    let stockList = get('estoque', []);
    if (!Array.isArray(stockList)) stockList = [];

    const firstSeed = localStorage.getItem(CATALOG_SEED_KEY) !== '1';
    let productsChanged = false;
    let stockChanged = false;

    if (firstSeed) {
      for (const row of CATALOG) {
        let product = productsList.find(
          item => normalize(item.nome) === normalize(row.name)
        );

        if (!product) {
          product = {
            id: id(),
            nome: row.name,
            createdAt: new Date().toISOString(),
            preloaded: true
          };
          productsList.push(product);
          productsChanged = true;
        }

        for (const [key, value] of Object.entries(row)) {
          if (key === 'name') continue;
          if (product[key] === undefined || product[key] === null) {
            product[key] = value;
            productsChanged = true;
          }
        }

        if (!stockList.some(item => normalize(item.nome) === normalize(row.name))) {
          stockList.push({
            id: id(),
            nome: row.name,
            qtd: 0,
            unidade: 'unidade',
            min: 0,
            validade: '',
            lote: '',
            obs: 'Produto pré-cadastrado. Ajuste o saldo e a unidade conforme a embalagem.',
            preloaded: true
          });
          stockChanged = true;
        }
      }

      /*
       * Corrige os estados automáticos da versão anterior. A correção é
       * limitada aos textos antigos exatos para não apagar uma edição manual.
       */
      const oldBulldockStatus =
        'Confirmado na bula consultada para abacaxi/broca-do-fruto; confirmar versão vigente';
      const oldBulldockDose =
        '80 mL/ha; volume de calda 200–500 L/ha; máximo 4 aplicações por ciclo; intervalo de segurança 14 dias.';
      const bulldock = productsList.find(p => normalize(p.nome) === normalize('BULLDOCK 125 SC'));

      if (bulldock && bulldock.statusIndicacao === oldBulldockStatus) {
        bulldock.statusIndicacao = 'Pendente de conferência';
        bulldock.cultura = '';
        if (bulldock.dose === oldBulldockDose) bulldock.dose = '';
        bulldock.modoAplicacao = '';
        productsChanged = true;
      }

      const decis = productsList.find(p => normalize(p.nome) === normalize('DECIS 25 EC'));
      if (decis && String(decis.statusIndicacao || '').startsWith('Cultura/alvos encontrados em fonte de bula')) {
        decis.statusIndicacao = 'Pendente de conferência';
        productsChanged = true;
      }

      if (productsChanged) set('produtos', productsList);
      if (stockChanged || localStorage.getItem(KEYS.estoque) === null) {
        set('estoque', stockList);
      }

      localStorage.setItem(CATALOG_SEED_KEY, '1');
    }
  }

  function products() {
    seedCatalog();
    return get('produtos', []);
  }

  function stock() {
    seedCatalog();
    return get('estoque', []);
  }

  function productsForFruit(fruitName) {
    const fruit = normalize(fruitName);
    if (!fruit) return [];

    return products().filter(product => {
      const cultures = String(product.cultura || '')
        .split(/[;\n]/)
        .map(normalize)
        .filter(Boolean);

      return cultures.some(culture =>
        culture.includes(fruit) ||
        (fruit === 'limao' && /\bcitros\b/.test(culture))
      );
    });
  }

  function apps() {
    const list = get('aplicacoes', []);
    return Array.isArray(list) ? list : [];
  }

  function diagnoses() {
    const list = get('diagnosticos', []);
    return Array.isArray(list) ? list : [];
  }

  function setSelect(selectId, items, placeholder = 'Selecione...') {
    const el = document.getElementById(selectId);
    if (!el) return;

    const oldValue = el.value;
    el.innerHTML =
      `<option value="">${esc(placeholder)}</option>` +
      items.map(item =>
        `<option value="${esc(item.id || item.nome)}">${esc(item.nome)}</option>`
      ).join('');

    if (items.some(item => String(item.id || item.nome) === oldValue)) {
      el.value = oldValue;
    }
  }

  function renderFruitSelects() {
    const list = fruits();
    ['fruta', 'frutaFiltro'].forEach(idSelect =>
      setSelect(idSelect, list, 'Selecione a cultura...')
    );
  }

  function init() {
    fruits();
    seedCatalog();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.Sitio = {
    KEYS,
    get,
    set,
    id,
    esc,
    dateNow,
    fmtDate,
    flash,
    nav,
    navHome,
    fruits,
    products,
    productsForFruit,
    stock,
    apps,
    diagnoses,
    renderFruitSelects,
    seedCatalog
  };
})();
