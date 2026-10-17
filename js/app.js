
/* Sítio Frutíferas — utilitários comuns.
   Produtos pendentes nunca são tratados como recomendação de aplicação. */
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

  function parse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  }

  function get(key, fallback = []) {
    const raw = localStorage.getItem(KEYS[key]);
    if (raw !== null) return parse(raw, fallback);

    for (const old of (oldKeys[key] || [])) {
      const legacy = localStorage.getItem(old);
      if (legacy !== null) {
        const val = parse(legacy, fallback);
        localStorage.setItem(KEYS[key], JSON.stringify(val));
        return val;
      }
    }
    return fallback;
  }

  function set(key, val) {
    localStorage.setItem(KEYS[key], JSON.stringify(val));
    return val;
  }

  function id() {
    return window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sf-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function esc(v = '') {
    return String(v).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function norm(v = '') {
    return String(v)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  function dateNow() {
    return new Date().toISOString().slice(0, 10);
  }

  function fmtDate(v) {
    if (!v) return 'Sem data';
    const d = new Date(v + 'T12:00:00');
    return Number.isNaN(d.getTime())
      ? esc(v)
      : d.toLocaleDateString('pt-BR');
  }

  function flash(msg, type = 'success') {
    let el = document.getElementById('mensagem-global');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mensagem-global';
      el.setAttribute('role', 'status');
      document.querySelector('.wrap')?.prepend(el);
    }
    el.className = 'notice ' + (type === 'error' ? 'error' : 'success');
    el.textContent = msg;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function nav() {
    const el = document.getElementById('nav');
    if (el) el.innerHTML = [
      ['../index.html', '🏡 Início'],
      ['frutas.html', '🌱 Minhas frutas'],
      ['busca.html', '📷 Foto e diagnóstico'],
      ['problemas.html', '🔎 Guia de problemas'],
      ['defensivos.html', '🧪 Produtos'],
      ['estoque.html', '📦 Estoque'],
      ['aplicacao.html', '📝 Aplicações'],
      ['historico.html', '📋 Histórico'],
      ['ajuda.html', '❓ Ajuda']
    ].map(([u, t]) => `<a href="${u}">${t}</a>`).join('');
  }

  function navHome() {
    const el = document.getElementById('nav');
    if (el) el.innerHTML = [
      ['paginas/frutas.html', '🌱 Minhas frutas'],
      ['paginas/busca.html', '📷 Foto e diagnóstico'],
      ['paginas/problemas.html', '🔎 Guia de problemas'],
      ['paginas/defensivos.html', '🧪 Produtos'],
      ['paginas/estoque.html', '📦 Estoque'],
      ['paginas/aplicacao.html', '📝 Registrar aplicação'],
      ['paginas/historico.html', '📋 Histórico'],
      ['paginas/ajuda.html', '❓ Ajuda']
    ].map(([u, t]) => `<a href="${u}">${t}</a>`).join('');
  }

  const CULTURAS = [
    'Pêssego', 'Morango', 'Abacaxi', 'Limão', 'Lichia',
    'Maçã', 'Cáqui', 'Manga', 'Goiaba'
  ];

  function defaultFruits() {
    return CULTURAS.map(nome => ({
      id: id(), nome, quantidade: '', talhao: '', obs: ''
    }));
  }

  function fruits() {
    let f = get('frutas', null);
    if (!Array.isArray(f)) f = [];

    let changed = false;
    for (const nome of CULTURAS) {
      if (!f.some(x => norm(x.nome) === norm(nome))) {
        f.push({
          id: id(), nome, quantidade: '', talhao: '', obs: ''
        });
        changed = true;
      }
    }

    if (changed || localStorage.getItem(KEYS.frutas) === null) {
      set('frutas', f);
    }
    return f;
  }

  /* Os produtos sem indicação confirmada permanecem no catálogo,
     mas não são associados automaticamente às frutas. */
  const CATALOG = [
    {
      name: 'FLORAFORTE-D',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar no rótulo',
      alvo: 'Finalidade não confirmada.',
      registro: 'Confirmar fabricante e rótulo'
    },
    {
      name: 'EXPERTGROW',
      categoria: 'Bioestimulante',
      ingrediente: 'Confirmar composição no rótulo',
      alvo: 'Conferir finalidade e culturas na ficha técnica.',
      registro: 'Ficha técnica do fabricante'
    },
    {
      name: 'SUPREME AGRO — ÓLEO MINERAL',
      categoria: 'Adjuvante',
      ingrediente: 'Óleo mineral; composição exata a confirmar',
      alvo: 'Confirmar finalidade e compatibilidade por cultura.',
      registro: 'Rótulo/ficha técnica'
    },
    {
      name: 'PÉROLA',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar',
      alvo: 'Finalidade não confirmada pelo nome isolado.',
      registro: 'Confirmar fabricante e rótulo'
    },
    {
      name: 'GLUTAMIN K LIBRE',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar',
      alvo: 'Finalidade não confirmada pelo nome isolado.',
      registro: 'Confirmar fabricante e rótulo'
    },
    {
      name: 'CRYSTAL LAYLAA',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar',
      alvo: 'Finalidade não confirmada pelo nome isolado.',
      registro: 'Confirmar fabricante e rótulo'
    },
    {
      name: 'FORTGREEN CaBDry',
      categoria: 'Fertilizante',
      ingrediente: 'Confirmar composição e garantias nutricionais',
      alvo: 'Conferir culturas e modo de aplicação na ficha técnica.',
      registro: 'Ficha técnica do fabricante'
    },
    {
      name: 'AZIMUT SC',
      categoria: 'A confirmar',
      ingrediente: 'Ingrediente ativo e categoria a confirmar',
      alvo: 'Não associar a culturas sem confirmar o produto exato.',
      registro: 'Consultar AGROFIT'
    },
    {
      name: 'GALIL SC',
      categoria: 'Defensivo',
      ingrediente: 'Confirmar formulação e rótulo vigente',
      alvo: 'Não confirmado para as nove frutas deste cadastro.',
      registro: 'Consultar AGROFIT'
    },
    {
      name: 'DECIS 25 EC',
      categoria: 'Defensivo',
      ingrediente: 'Deltametrina 25 g/L; confirmar embalagem',
      alvo: 'Inseticida. Cultura e praga precisam ser confirmadas na bula vigente.',
      registro: 'MAPA 00758498'
    },
    {
      name: 'BELT',
      categoria: 'Defensivo',
      ingrediente: 'Confirmar ingrediente ativo e formulação',
      alvo: 'Confirmar culturas, pragas e dose na bula vigente.',
      registro: 'Consultar AGROFIT'
    },
    {
      name: 'PRIORI XTRA',
      categoria: 'Defensivo',
      ingrediente: 'Confirmar formulação e rótulo vigente',
      alvo: 'Fungicida; indicação para estas frutas não confirmada.',
      registro: 'Consultar AGROFIT'
    },
    {
      name: 'BULLDOCK 125 SC',
      categoria: 'Defensivo',
      ingrediente: 'Beta-ciflutrina 125 g/L',
      alvo: 'Abacaxi: broca-do-fruto (Strymon basalides).',
      cultura: 'Abacaxi',
      dose: '80 mL/ha; volume de calda de 200–500 L/ha; máximo de 4 aplicações; intervalo de segurança de 14 dias.',
      modoAplicacao: 'Bula consultada: pulverização terrestre. Iniciar após o aparecimento da praga; se necessário, reaplicar com intervalo de 15 dias até o fechamento das últimas flores. Conferir a bula vigente antes de usar.',
      statusIndicacao: 'Confirmado na bula consultada — abacaxi; conferir versão vigente',
      fonte: 'https://www.adapar.pr.gov.br/sites/adapar/arquivos_restritos/files/documento/2025-09/buldock125sc.pdf',
      registro: 'MAPA 01192'
    },
    {
      name: 'ARTYS (Cletodim)',
      categoria: 'Herbicida a confirmar',
      ingrediente: 'Cletodim informado; marca e formulação a confirmar',
      alvo: 'Não aplicar no pomar sem autorização expressa para a cultura e situação.',
      registro: 'Confirmar nome comercial e registro'
    },
    {
      name: 'FRENO 240 EC',
      categoria: 'A confirmar',
      ingrediente: 'Ingrediente ativo e categoria a confirmar',
      alvo: 'Não inferir composição pelo nome comercial.',
      registro: 'Consultar AGROFIT'
    },
    {
      name: 'HUMIC FLOWER',
      categoria: 'Fertilizante a confirmar',
      ingrediente: 'Composição a confirmar',
      alvo: 'Conferir culturas, dose e via de aplicação na ficha técnica.',
      registro: 'Ficha técnica do fabricante'
    },
    {
      name: 'HERBAMOV',
      categoria: 'A confirmar',
      ingrediente: 'Ingrediente ativo e categoria a confirmar',
      alvo: 'Não inferir composição pelo nome comercial.',
      registro: 'Consultar AGROFIT'
    }
  ];

  function seedCatalog() {
    let ps = get('produtos', []);
    if (!Array.isArray(ps)) ps = [];
    let changed = false;

    for (const row of CATALOG) {
      let p = ps.find(x => norm(x.nome) === norm(row.name));

      if (!p) {
        p = {
          id: id(),
          nome: row.name,
          createdAt: new Date().toISOString(),
          preloaded: true
        };
        ps.push(p);
        changed = true;
      }

      const defaults = {
        categoria: row.categoria,
        ingrediente: row.ingrediente,
        alvo: row.alvo,
        cultura: row.cultura || '',
        dose: row.dose || '',
        modoAplicacao: row.modoAplicacao || '',
        statusIndicacao: row.statusIndicacao || 'Pendente de conferência',
        fonte: row.fonte || '',
        registro: row.registro || ''
      };

      for (const [k, v] of Object.entries(defaults)) {
        if (p[k] === undefined || p[k] === null || p[k] === '') {
          p[k] = v;
          changed = true;
        }
      }
    }

    if (changed || localStorage.getItem(KEYS.produtos) === null) {
      set('produtos', ps);
    }

    let st = get('estoque', []);
    if (!Array.isArray(st)) st = [];
    let stockChanged = false;

    for (const row of CATALOG) {
      if (!st.some(x => norm(x.nome) === norm(row.name))) {
        st.push({
          id: id(),
          nome: row.name,
          qtd: 0,
          unidade: 'unidade',
          min: 0,
          validade: '',
          lote: '',
          obs: 'Produto pré-cadastrado; preencher saldo e unidade conforme embalagem.',
          preloaded: true
        });
        stockChanged = true;
      }
    }

    if (stockChanged || localStorage.getItem(KEYS.estoque) === null) {
      set('estoque', st);
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

  /* Lista somente associações marcadas como confirmadas.
     Cultura e alvo devem estar registrados no produto.
     Produtos pendentes não aparecem como recomendação na página da fruta. */
  function productsForFruit(fruitName) {
    const fruit = norm(fruitName);

    return products().filter(p => {
      const status = norm(p.statusIndicacao || '');
      const confirmed =
        status.startsWith('confirmado na bula consultada') ||
        status.startsWith('confirmado na bula vigente');

      if (!confirmed) return false;

      const cultures = String(p.cultura || '')
        .split(/[;\n]/)
        .map(x => norm(x));

      return cultures.some(c => {
        const cropName = c.split(/[—–-]/)[0].trim();
        if (fruit === 'limao') {
          return cropName === 'limao' || cropName === 'citros';
        }
        return cropName === fruit;
      });
    });
  }

  function apps() {
    return get('aplicacoes', []);
  }

  function diagnoses() {
    return get('diagnosticos', []);
  }

  function setSelect(idSel, items, placeholder = 'Selecione...') {
    const el = document.getElementById(idSel);
    if (!el) return;

    const old = el.value;
    el.innerHTML =
      `<option value="">${esc(placeholder)}</option>` +
      items.map(x =>
        `<option value="${esc(x.id || x.nome)}">${esc(x.nome)}</option>`
      ).join('');

    if (items.some(x => String(x.id || x.nome) === old)) {
      el.value = old;
    }
  }

  function renderFruitSelects() {
    const f = fruits();
    ['fruta', 'frutaFiltro'].forEach(x =>
      setSelect(x, f, 'Selecione a cultura...')
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
    KEYS, get, set, id, esc, dateNow, fmtDate, flash,
    nav, navHome, fruits, products, productsForFruit,
    stock, apps, diagnoses, renderFruitSelects, seedCatalog
  };
})();
