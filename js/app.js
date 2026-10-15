/* Sítio Frutíferas — utilitários comuns.
   Os dados ficam no navegador até configurar um banco sincronizado. */
(function () {
  'use strict';

  const KEYS = {
    frutas: 'sf_frutas',
    produtos: 'sf_produtos',
    estoque: 'sf_estoque',
    aplicacoes: 'sf_aplicacoes',
    diagnosticos: 'sf_diagnosticos',
    config: 'sf_config'
  };

  const oldKeys = {
    frutas: ['frutas'],
    produtos: ['defensivos', 'produtos'],
    estoque: ['estoque'],
    aplicacoes: ['historico', 'aplicacoes'],
    diagnosticos: ['diagnosticos'],
    config: ['sf_config']
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
        const value = parse(legacy, fallback);
        localStorage.setItem(KEYS[key], JSON.stringify(value));
        return value;
      }
    }

    return fallback;
  }

  function set(key, value) {
    localStorage.setItem(KEYS[key], JSON.stringify(value));
    return value;
  }

  function id() {
    return crypto?.randomUUID?.() ||
      ('sf-' + Date.now() + '-' + Math.random().toString(16).slice(2));
  }

  function esc(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function dateNow() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
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
    ].map(([url, title]) =>
      `<a href="${url}">${title}</a>`
    ).join('');
  }

  function navHome() {
    const el = document.getElementById('nav');

    if (!el) return;

    el.innerHTML = [
      ['paginas/frutas.html', '🌱 Minhas frutas'],
      ['paginas/busca.html', '📷 Foto e diagnóstico'],
      ['paginas/problemas.html', '🔎 Guia de problemas'],
      ['paginas/defensivos.html', '🧪 Produtos'],
      ['paginas/estoque.html', '📦 Estoque'],
      ['paginas/aplicacao.html', '📝 Registrar aplicação'],
      ['paginas/historico.html', '📋 Histórico'],
      ['paginas/ajuda.html', '❓ Ajuda']
    ].map(([url, title]) =>
      `<a href="${url}">${title}</a>`
    ).join('');
  }

  function defaultFruits() {
    return [
      'Pêssego', 'Morango', 'Goiaba',
      'Limão', 'Abacaxi', 'Lichia'
    ].map(nome => ({
      id: id(),
      nome,
      quantidade: '',
      talhao: '',
      obs: ''
    }));
  }

  function fruits() {
    let list = get('frutas', null);

    if (!Array.isArray(list) || !list.length) {
      list = defaultFruits();
      set('frutas', list);
    }

    return list;
  }

  function products() {
    return get('produtos', []);
  }

  function stock() {
    return get('estoque', []);
  }

  function apps() {
    return get('aplicacoes', []);
  }

  function diagnoses() {
    return get('diagnosticos', []);
  }

  function setSelect(elementId, items, placeholder = 'Selecione...') {
    const el = document.getElementById(elementId);
    if (!el) return;

    const old = el.value;

    el.innerHTML =
      `<option value="">${esc(placeholder)}</option>` +
      items.map(item =>
        `<option value="${esc(item.id || item.nome)}">${esc(item.nome)}</option>`
      ).join('');

    if (items.some(item => String(item.id || item.nome) === old)) {
      el.value = old;
    }
  }

  function renderFruitSelects() {
    const list = fruits();
    ['fruta', 'frutaFiltro'].forEach(elementId => {
      setSelect(elementId, list, 'Selecione a cultura...');
    });
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
    stock,
    apps,
    diagnoses,
    renderFruitSelects
  };
})();
