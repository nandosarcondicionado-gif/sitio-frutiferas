/* Sítio Frutíferas — utilitários comuns.
Os dados ficam no navegador até configurar banco sincronizado. */
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

if (raw !== null) {
  return parse(raw, fallback);
}

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
return (
crypto?.randomUUID?.() ||
('sf-' + Date.now() + '-' + Math.random().toString(16).slice(2))
);
}

function esc(v = '') {
return String(v).replace(/[&<>"']/g, c => ({
'&': '&',
'<': '<',
'>': '>',
'"': '"',
"'": '''
})[c]);
}

function dateNow() {
const d = new Date();
return [
d.getFullYear(),
String(d.getMonth() + 1).padStart(2, '0'),
String(d.getDate()).padStart(2, '0')
].join('-');
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

el.className = 'notice ' + (
  type === 'error' ? 'error' : 'success'
);

el.textContent = msg;
el.scrollIntoView({
  behavior: 'smooth',
  block: 'nearest'
});

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

// Culturas iniciais do Sítio Frutíferas.
// Os cadastros existentes serão preservados.
function defaultFruits() {
const culturas = [
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

return culturas.map(nome => ({
  id: id(),
  nome,
  quantidade: '',
  talhao: '',
  obs: ''
}));

}

function fruits() {
let f = get('frutas', null);

if (!Array.isArray(f)) {
  f = [];
}

// Inclui culturas que faltam sem apagar os registros existentes.
const culturas = [
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

let alterado = false;

for (const nome of culturas) {
  const existe = f.some(item =>
    String(item.nome || '').trim().toLocaleLowerCase('pt-BR') ===
    nome.toLocaleLowerCase('pt-BR')
  );

  if (!existe) {
    f.push({
      id: id(),
      nome,
      quantidade: '',
      talhao: '',
      obs: ''
    });

    alterado = true;
  }
}

if (alterado || localStorage.getItem(KEYS.frutas) === null) {
  set('frutas', f);
}

return f;

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

function setSelect(
idSel,
items,
placeholder = 'Selecione...'
) {
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

['fruta', 'frutaFiltro'].forEach(x => {
  setSelect(x, f, 'Selecione a cultura...');
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
