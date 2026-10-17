
/* Sítio Frutíferas — utilitários comuns. Dados locais neste navegador. */
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
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
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
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  function normalizar(texto) {
    return String(texto || '')
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

    if (el) {
      el.innerHTML = [
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
  }

  function navHome() {
    const el = document.getElementById('nav');

    if (el) {
      el.innerHTML = [
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
  }

  const CULTURAS = [
    'Pêssego',
    'Morango',
    'Abacaxi',
    'Limão',
    'Lichia',
    'Maçã',
    'Cáqui',
    'Manga',
    'Goiaba'
  ];

  function defaultFruits() {
    return CULTURAS.map(nome => ({
      id: id(),
      nome,
      quantidade: '',
      talhao: '',
      obs: ''
    }));
  }

  function fruits() {
    let f = get('frutas', null);

    if (!Array.isArray(f)) f = [];

    let changed = false;

    for (const nome of CULTURAS) {
      if (!f.some(x =>
        normalizar(x.nome) === normalizar(nome)
      )) {
        f.push({
          id: id(),
          nome,
          quantidade: '',
          talhao: '',
          obs: ''
        });

        changed = true;
      }
    }

    if (changed || localStorage.getItem(KEYS.frutas) === null) {
      set('frutas', f);
    }

    return f;
  }

  /*
   * Catálogo inicial.
   * Não preencher automaticamente doses ou indicações não confirmadas.
   */
  const CATALOG = [
    {
      name: 'FLORAFORTE-D',
      categoria: 'Outro insumo',
      ingrediente: 'Composição a confirmar no rótulo',
      alvo: 'Finalidade não confirmada pelo nome comercial isolado.',
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
      alvo: 'Confirmar finalidade, compatibilidade e autorização antes de usar.',
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
      alvo: 'Finalidade não confirmada pelo nome comercial isolado.',
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
      alvo: 'Finalidade não confirmada pelo nome comercial isolado.',
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
      alvo: 'Finalidade não confirmada pelo nome comercial isolado.',
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
      alvo: 'Conferir garantias nutricionais e modo de aplicação na ficha técnica.',
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
      ingrediente: 'Ingrediente ativo a confirmar para a formulação exata',
      alvo: 'Não definir cultura ou dose sem confirmar o registro e a bula.',
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
      ingrediente: 'Bifentrina + imidacloprido; confirmar no rótulo vigente',
      alvo: 'Confirmar culturas e alvos autorizados para a formulação exata.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência para as nove frutíferas',
      fonte: 'https://www.adama.com/brasil/pt/protecao-de-cultivos/inseticidas/galilsc',
      registro: 'Confirmar número de registro na embalagem'
    },
    {
      name: 'DECIS 25 EC',
      categoria: 'Defensivo',
      ingrediente: 'Deltametrina 25 g/L',
      alvo: 'Inseticida. Cultura, alvo, dose e intervalo dependem da bula vigente.',
      cultura: 'Pêssego — indicação a confirmar; Morango — indicação a confirmar; Abacaxi — indicação a confirmar; Limão — indicação a confirmar; Lichia — indicação a confirmar; Maçã — indicação a confirmar; Cáqui — indicação a confirmar; Manga — indicação a confirmar; Goiaba — indicação a confirmar.',
      dose: '',
      modoAplicacao: 'Preencher após conferir a bula vigente para a cultura e o alvo exatos.',
      statusIndicacao: 'Pendente de conferência para cada cultura e alvo',
      fonte: 'https://revistacultivar.com.br/pesticida/decis-25-ec',
      registro: 'MAPA 00758498 — confirmar na embalagem'
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
      ingrediente: 'Azoxistrobina 200 g/L + ciproconazol 80 g/L; confirmar bula vigente',
      alvo: 'Fungicida. Confirmar indicação específica por cultura e doença.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência para as nove frutíferas',
      fonte: 'https://portal.syngenta.com.br/produtos/priori-xtra/',
      registro: 'Confirmar número de registro na embalagem'
    },
    {
      name: 'BULLDOCK 125 SC',
      categoria: 'Defensivo',
      ingrediente: 'Beta-ciflutrina 125 g/L; confirmar no rótulo',
      alvo: 'Inseticida. Existe referência de bula para abacaxi e broca-do-fruto; conferir a versão vigente.',
      cultura: 'Abacaxi — broca-do-fruto; indicação pendente de confirmação na bula vigente.',
      dose: '',
      modoAplicacao: 'Preencher após conferir a bula vigente e o alvo exato.',
      statusIndicacao: 'Pendente de confirmação da bula vigente',
      fonte: 'https://revistacultivar.com.br/pesticida/bulldock-125-sc',
      registro: 'Confirmar número de registro na embalagem'
    },
    {
      name: 'ARTYS (Cletodim)',
      categoria: 'Defensivo',
      ingrediente: 'Cletodim informado pelo usuário; marca e formulação a confirmar',
      alvo: 'Herbicida para situações específicas. Não aplicar no pomar sem autorização expressa para a cultura.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência — não associado às frutíferas',
      fonte: '',
      registro: 'Confirmar nome comercial e registro'
    },
    {
      name: 'FRENO 240 EC',
      categoria: 'Classificação a confirmar',
      ingrediente: 'Ingrediente ativo e categoria a confirmar',
      alvo: 'Não inferir composição a partir do nome; conferir o registro e a bula exata.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Consultar AGROFIT'
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
      alvo: 'Não inferir composição a partir do nome; conferir o registro e a bula exata.',
      cultura: '',
      dose: '',
      modoAplicacao: '',
      statusIndicacao: 'Pendente de conferência',
      fonte: '',
      registro: 'Consultar AGROFIT'
    }
  ];

  function seedCatalog() {
    let ps = get('produtos', []);

    if (!Array.isArray(ps)) ps = [];

    let changed = false;

    for (const row of CATALOG) {
      let p = ps.find(x =>
        normalizar(x.nome) === normalizar(row.name)
      );

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

      /*
       * Preenche somente campos vazios.
       * Assim, preserva as informações que você já editou.
       */
      for (const [k, v] of Object.entries({
        categoria: row.categoria,
        ingrediente: row.ingrediente,
        alvo: row.alvo,
        cultura: row.cultura,
        dose: row.dose,
        modoAplicacao: row.modoAplicacao,
        statusIndicacao: row.statusIndicacao,
        fonte: row.fonte,
        registro: row.registro
      })) {
        if (
          (p[k] === undefined || p[k] === null || p[k] === '') &&
          v !== ''
        ) {
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
      if (!st.some(x => normalizar(x.nome) === normalizar(row.name))) {
        st.push({
          id: id(),
          nome: row.name,
          qtd: 0,
          unidade: 'unidade',
          min: 0,
          validade: '',
          lote: '',
          obs: 'Produto pré-cadastrado; preencher saldo e ajustar unidade conforme embalagem.',
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

  /*
   * Mostra:
   * 1. Produtos cuja cultura cadastrada corresponde à fruta.
   * 2. Produtos sem cultura preenchida, como pendentes.
   *
   * Produtos cadastrados para outra cultura não são associados automaticamente.
   */
  function productsForFruit(fruitName) {
    const fruta = normalizar(fruitName);

    return products().filter(p => {
      const cultura = normalizar(p.cultura);

      if (!cultura) return true;

      const partes = cultura.split(';').map(normalizar);

      return partes.some(parte => {
        if (!parte) return false;

        if (fruta === 'limao' && parte.includes('citros')) {
          return true;
        }

        return parte.includes(fruta);
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
