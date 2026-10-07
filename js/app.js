// ==========================================
// SÍTIO FRUTÍFERAS — Controle de Defensivos
// Versão 2.0 — Frutas com produtos específicos
// ==========================================

// ========== BANCO DE DADOS LOCAL ==========
function carregarDados(chave, padrao) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : padrao;
}

function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

// ========== DADOS INICIAIS COM PRODUTOS ESPECÍFICOS ==========
let frutas = carregarDados('frutas', [
    {
        id: 1,
        nome: 'Pêssego',
        quantidade: '50',
        talhao: 'Talhão A',
        obs: 'Época de colheita: Nov/Mar',
        produtos: [
            { id: 101, nome: 'Cupragin', funcao: 'Ferrugem, Podridão, Manchas', dose: 2.0, unidade: 'ml', carencia: 21 },
            { id: 102, nome: 'Dithane', funcao: 'Antracnose, Podridão de flor', dose: 1.5, unidade: 'ml', carencia: 14 },
            { id: 103, nome: 'Óleo Mineral', funcao: 'Pulgão, Cochonilha, Ácaro', dose: 10.0, unidade: 'ml', carencia: 7 },
            { id: 104, nome: 'Calda Bordalesa', funcao: 'Prevenção de doenças de folha', dose: 10.0, unidade: 'g', carencia: 14 }
        ]
    },
    {
        id: 2,
        nome: 'Abacaxi',
        quantidade: '30',
        talhao: 'Talhão B',
        obs: 'Época de colheita: Ago/Dez',
        produtos: [
            { id: 201, nome: 'Cupragin', funcao: 'Podridão da base, Ferrugem', dose: 1.5, unidade: 'ml', carencia: 21 },
            { id: 202, nome: 'Dithane', funcao: 'Podridão do fruto', dose: 1.5, unidade: 'g', carencia: 14 },
            { id: 203, nome: 'Óleo Mineral', funcao: 'Cochonilha, Mosca branca', dose: 8.0, unidade: 'ml', carencia: 7 }
        ]
    },
    {
        id: 3,
        nome: 'Morango',
        quantidade: '100',
        talhao: 'Horta',
        obs: 'Época de colheita: Jun/Set',
        produtos: [
            { id: 301, nome: 'Cupragin', funcao: 'Oídio, Manchas foliares', dose: 1.0, unidade: 'ml', carencia: 7 },
            { id: 302, nome: 'Dithane', funcao: 'Mofo cinzento, Podridão', dose: 1.5, unidade: 'g', carencia: 7 },
            { id: 303, nome: 'Enxofre', funcao: 'Oídio (mofo branco)', dose: 2.0, unidade: 'g', carencia: 5 },
            { id: 304, nome: 'Óleo Mineral', funcao: 'Pulgão, Ácaro', dose: 7.0, unidade: 'ml', carencia: 7 }
        ]
    },
    {
        id: 4,
        nome: 'Limão',
        quantidade: '40',
        talhao: 'Talhão C',
        obs: 'Época de colheita: Anual (mais em Set/Jan)',
        produtos: [
            { id: 401, nome: 'Cupragin', funcao: 'Ferrugem, Cancro, Podridão', dose: 2.0, unidade: 'ml', carencia: 21 },
            { id: 402, nome: 'Óleo Mineral', funcao: 'Cochonilha, Pulgão, Ácaro', dose: 10.0, unidade: 'ml', carencia: 15 },
            { id: 403, nome: 'Calda Bordalesa', funcao: 'Prevenção de doenças', dose: 10.0, unidade: 'g', carencia: 21 }
        ]
    },
    {
        id: 5,
        nome: 'Goiaba',
        quantidade: '25',
        talhao: 'Talhão A',
        obs: 'Época de colheita: Out/Mar',
        produtos: [
            { id: 501, nome: 'Cupragin', funcao: 'Antracnose, Podridão', dose: 2.0, unidade: 'ml', carencia: 21 },
            { id: 502, nome: 'Dithane', funcao: 'Broca-do-fruto, Manchas', dose: 1.5, unidade: 'g', carencia: 14 },
            { id: 503, nome: 'Óleo Mineral', funcao: 'Cochonilha, Pulgão', dose: 8.0, unidade: 'ml', carencia: 7 }
        ]
    },
    {
        id: 6,
        nome: 'Lichia',
        quantidade: '15',
        talhao: 'Talhão C',
        obs: 'Época de colheita: Mai/Jun',
        produtos: [
            { id: 601, nome: 'Cupragin', funcao: 'Antracnose, Podridão floral', dose: 1.5, unidade: 'ml', carencia: 21 },
            { id: 602, nome: 'Dithane', funcao: 'Podridão do fruto, Manchas', dose: 1.5, unidade: 'g', carencia: 14 },
            { id: 603, nome: 'Óleo Mineral', funcao: 'Cochonilha, Ácaro', dose: 8.0, unidade: 'ml', carencia: 7 }
        ]
    }
]);
let defensivos = carregarDados('defensivos', []);
let estoque = carregarDados('estoque', []);
let historico = carregarDados('historico', []);
let galeria = carregarDados('galeria', []);
let duvidas = carregarDados('duvidas', []);

let editandoFrutaId = null;
let frutaAtualId = null;

// ========== NAVEGAÇÃO ==========
function mostrarSecao(id) {
    document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.querySelector('.menu-principal')?.style.display = 'none';
    document.getElementById('btn-voltar').style.display = 'block';
    
    if (id === 'frutas') renderizarListaFrutas();
    if (id === 'defensivos') renderizarDefensivos();
    if (id === 'aplicar') preencherSeletoresAplicacao();
    if (id === 'estoque') renderizarEstoque();
    if (id === 'historico') renderizarHistorico();
    if (id === 'galeria') renderizarGaleria();
    if (id === 'ajuda') {}
}

function voltarInicio() {
    window.location.href = '../index.html';
}

function voltarParaListaFrutas() {
    document.getElementById('detalhes-fruta-tela').style.display = 'none';
    document.getElementById('lista-frutas-tela').style.display = 'block';
    renderizarListaFrutas();
}

// ========== FRUTAS E PRODUTOS ESPECÍFICOS ==========
function renderizarListaFrutas() {
    const lista = document.getElementById('lista-frutas-conteudo');
    if (frutas.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhuma fruta cadastrada ainda. Clique em "+ Nova Fruta" para começar!</p>';
        return;
    }
    lista.innerHTML = frutas.map(f => `
        <div class="item" onclick="abrirDetalhesFruta(${f.id})">
            <div class="item-titulo">${f.nome}</div>
            <p>🌳 Quantidade: ${f.quantidade} pés</p>
            <p>📍 Local/Talhão: ${f.talhao}</p>
            <p>📅 ${f.obs}</p>
            <p style="color: #1976d2; font-size: 14px; margin-top: 5px;">
                🧪 ${f.produtos.length} produtos específicos → Clique para ver
            </p>
        </div>
    `).join('');
}

function abrirDetalhesFruta(id) {
    frutaAtualId = id;
    const fruta = frutas.find(f => f.id === id);
    
    document.getElementById('fruta-nome-detalhe').textContent = `🍑 ${fruta.nome}`;
    document.getElementById('fruta-talhao-detalhe').textContent = `Local/Talhão: ${fruta.talhao}`;
    document.getElementById('fruta-quantidade-detalhe').textContent = `Quantidade: ${fruta.quantidade} pés`;
    document.getElementById('fruta-obs-detalhe').textContent = fruta.obs;
    
    renderizarProdutosFruta(fruta.produtos);
    
    document.getElementById('lista-frutas-tela').style.display = 'none';
    document.getElementById('detalhes-fruta-tela').style.display = 'block';
}

function renderizarProdutosFruta(produtos) {
    const lista = document.getElementById('fruta-produtos');
    if (produtos.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhum produto específico cadastrado ainda.</p>';
        return;
    }
    lista.innerHTML = produtos.map(p => `
        <div class="item">
            <div class="item
