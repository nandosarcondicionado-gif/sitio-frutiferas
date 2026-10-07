// ==========================================
// SÍTIO FRUTÍFERAS — Controle de Defensivos
// Versão COMPLETA com Reconhecimento de Fotos
// ==========================================

// ========== BANCO DE DADOS LOCAL ==========
function carregarDados(chave, padrao) {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : padrao;
}
function salvarDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

// ========== DADOS INICIAIS ==========
let frutas = carregarDados('frutas', [
    {
        id: 1, nome: 'Pêssego', quantidade: '50', talhao: 'Talhão A',
        obs: 'Época de colheita: Nov/Mar',
        produtos: [
            { id: 101, nome: 'Cupragin', funcao: 'Ferrugem, Podridão, Manchas', dose: 2.0, unidade: 'ml', carencia: 21 },
            { id: 102, nome: 'Dithane', funcao: 'Antracnose, Podridão de flor', dose: 1.5, unidade: 'ml', carencia: 14 },
            { id: 103, nome: 'Óleo Mineral', funcao: 'Pulgão, Cochonilha, Ácaro', dose: 10.0, unidade: 'ml', carencia: 7 },
            { id: 104, nome: 'Calda Bordalesa', funcao: 'Prevenção de doenças de folha', dose: 10.0, unidade: 'g', carencia: 14 }
        ]
    },
    {
        id: 2, nome: 'Abacaxi', quantidade: '30', talhao: 'Talhão B',
        obs: 'Época de colheita: Ago/Dez',
        produtos: [
            { id: 201, nome: 'Cupragin', funcao: 'Podridão da base, Ferrugem', dose: 1.5, unidade: 'ml', carencia: 21 },
            { id: 202, nome: 'Dithane', funcao: 'Podridão do fruto', dose: 1.5, unidade: 'g', carencia: 14 },
            { id: 203, nome: 'Óleo Mineral', funcao: 'Cochonilha, Mosca branca', dose: 8.0, unidade: 'ml', carencia: 7 }
        ]
    },
    {
        id: 3, nome: 'Morango', quantidade: '100', talhao: 'Horta',
        obs: 'Época de colheita: Jun/Set',
        produtos: [
            { id: 301, nome: 'Cupragin', funcao: 'Oídio, Manchas foliares', dose: 1.0, unidade: 'ml', carencia: 7 },
            { id: 302, nome: 'Dithane', funcao: 'Mofo cinzento, Podridão', dose: 1.5, unidade: 'g', carencia: 7 },
            { id: 303, nome: 'Enxofre', funcao: 'Oídio (mofo branco)', dose: 2.0, unidade: 'g', carencia: 5 },
            { id: 304, nome: 'Óleo Mineral', funcao: 'Pulgão, Ácaro', dose: 7.0, unidade: 'ml', carencia: 7 }
        ]
    },
    {
        id: 4, nome: 'Limão', quantidade: '40', talhao: 'Talhão C',
        obs: 'Época de colheita: Anual (mais em Set/Jan)',
        produtos: [
            { id: 401, nome: 'Cupragin', funcao: 'Ferrugem, Cancro, Podridão', dose: 2.0, unidade: 'ml', carencia: 21 },
            { id: 402, nome: 'Óleo Mineral', funcao: 'Cochonilha, Pulgão, Ácaro', dose: 10.0, unidade: 'ml', carencia: 15 },
            { id: 403, nome: 'Calda Bordalesa', funcao: 'Prevenção de doenças', dose: 10.0, unidade: 'g', carencia: 21 }
        ]
    },
    {
        id: 5, nome: 'Goiaba', quantidade: '25', talhao: 'Talhão A',
        obs: 'Época de colheita: Out/Mar',
        produtos: [
            { id: 501, nome: 'Cupragin', funcao: 'Antracnose, Podridão', dose: 2.0, unidade: 'ml', carencia: 21 },
            { id: 502, nome: 'Dithane', funcao: 'Broca-do-fruto, Manchas', dose: 1.5, unidade: 'g', carencia: 14 },
            { id: 503, nome: 'Óleo Mineral', funcao: 'Cochonilha, Pulgão', dose: 8.0, unidade: 'ml', carencia: 7 }
        ]
    },
    {
        id: 6, nome: 'Lichia', quantidade: '15', talhao: 'Talhão C',
        obs: 'Época de colheita: Mai/Jun',
        produtos: [
            { id: 601, nome: 'Cupragin', funcao: 'Antracnose, Podridão floral', dose: 1.5, unidade: 'ml', carencia: 21 },
            { id: 602, nome: 'Dithane', funcao: 'Podridão do fruto, Manchas', dose: 1.5, unidade: 'g', carencia: 14 },
            { id: 603, nome: 'Óleo Mineral', funcao: 'Cochonilha, Ácaro', dose: 8.0, unidade: 'ml', carencia: 7 }
        ]
    }
]);
let frutaAtualId = null;

// ========== NAVEGAÇÃO ==========
function voltarInicio() {
    window.location.href = '../index.html';
}
function voltarParaListaFrutas() {
    document.getElementById('detalhes-fruta-tela').style.display = 'none';
    document.getElementById('lista-frutas-tela').style.display = 'block';
    renderizarListaFrutas();
}

// ========== LISTA DE FRUTAS ==========
function renderizarListaFrutas() {
    const lista = document.getElementById('lista-frutas-conteudo');
    if (frutas.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhuma fruta cadastrada.</p>';
        return;
    }
    lista.innerHTML = frutas.map(f => `
        <div class="item" onclick="abrirDetalhesFruta(${f.id})" style="cursor:pointer;">
            <div class="item-titulo">${f.nome}</div>
            <p>🌳 ${f.quantidade} pés | 📍 ${f.talhao}</p>
            <p>📅 ${f.obs}</p>
            <p style="color: #1976d2; font-size:14px;">🧪 ${f.produtos.length} produtos → Clique para ver</p>
        </div>
    `).join('');
}

// ========== DETALHES DA FRUTA ==========
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
    if (!produtos || produtos.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhum produto cadastrado.</p>';
        return;
    }
    lista.innerHTML = produtos.map(p => {
        const v20 = (p.dose * 20).toFixed(1).replace('.0', '');
        const v200 = (p.dose * 200).toFixed(1).replace('.0', '');
        return `
        <div class="item">
            <div class="item-titulo">🧪 ${p.nome}</div>
            <p>✅ Para: ${p.funcao}</p>
            <p>📊 Dose: ${p.dose} ${p.unidade}/L</p>
            <p>💧 20L → <strong>${v20} ${p.unidade}</strong> | 💧 200L → <strong>${v200} ${p.unidade}</strong></p>
            <p>⏳ Carência: ${p.carencia} dias</p>
        </div>
        `;
    }).join('');
}

// ========== MODAIS ==========
function abrirModalFruta() {
    document.getElementById('modal-fruta').style.display = 'block';
    document.getElementById('fruta-nome').value = '';
    document.getElementById('fruta-quantidade').value = '';
    document.getElementById('fruta-talhao').value = '';
    document.getElementById('fruta-obs').value = '';
}
function abrirModalProdutoFruta() {
    document.getElementById('modal-produto-fruta').style.display = 'block';
    document.getElementById('produto-nome').value = '';
    document.getElementById('produto-funcao').value = '';
    document.getElementById('produto-dose').value = '';
    document.getElementById('produto-carencia').value = '';
}
function fecharModal(nome) {
    document.getElementById(`modal-${nome}`).style.display = 'none';
}
window.onclick = function(e) {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
};

// ========== SALVAR FRUTA ==========
function salvarFruta() {
    const nome = document.getElementById('fruta-nome').value.trim();
    const qtd = document.getElementById('fruta-quantidade').value.trim();
    const talhao = document.getElementById('fruta-talhao').value.trim();
    const obs = document.getElementById('fruta-obs').value.trim();
    if (!nome) { alert('Digite o nome da fruta!'); return; }
    
    const nova = {
        id: Date.now(), nome, quantidade: qtd || '0', talhao: talhao || 'Não informado',
        obs: obs || '', produtos: []
    };
    frutas.push(nova);
    salvarDados('frutas', frutas);
    fecharModal('fruta');
    renderizarListaFrutas();
}

// ========== SALVAR PRODUTO ==========
function salvarProdutoFruta() {
    const nome = document.getElementById('produto-nome').value.trim();
    const funcao = document.getElementById('produto-funcao').value.trim();
    const dose = parseFloat(document.getElementById('produto-dose').value);
    const unidade = document.getElementById('produto-unidade').value;
    const carencia = parseInt(document.getElementById('produto-carencia').value);
    if (!nome || !dose) { alert('Preencha nome e dose!'); return; }
    
    const fruta = frutas.find(f => f.id === frutaAtualId);
    fruta.produtos.push({
        id: Date.now(), nome, funcao: funcao || 'Não informado', dose, unidade,
        carencia: carencia || 7
    });
    salvarDados('frutas', frutas);
    fecharModal('produto-fruta');
    renderizarProdutosFruta(fruta.produtos);
}

// ========== 📷 RECONHECIMENTO DE FOTOS ==========
const CHAVE_API_PLANTNET = '2b8Qr5B7s8T9zX3aDfGhjKl';

function abrirCamera() {
    document.getElementById('camera-secao').style.display = 'block';
    document.getElementById('resultado-reconhecimento').innerHTML = '';
    document.getElementById('preview-foto').innerHTML = '';
}

async function processarFoto(input) {
    const arquivo = input.files[0];
    if (!arquivo) return;
    
    const preview = document.getElementById('preview-foto');
    preview.innerHTML = `<img src="${URL.createObjectURL(arquivo)}" style="max-width:100%; border-radius:8px;">`;
    
    const resultado = document.getElementById('resultado-reconhecimento');
    resultado.innerHTML = `<p>🔄 Analisando a imagem... Aguarde um instante ⏳</p>`;

    try {
        const base64 = await lerArquivoComoBase64(arquivo);
        const resposta = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${CHAVE_API_PLANTNET}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                images: [base64], organs: ['leaf', 'flower', 'fruit', 'bark'], 'include-related': false
            })
        });

        const dados = await resposta.json();
        if (dados.results && dados.results.length > 0) {
            mostrarResultado(dados.results);
        } else {
            resultado.innerHTML = `
                <p>❌ Não consegui identificar com clareza.</p>
                <p>💡 Tente tirar a foto mais de perto, com boa luz e sem sombra.</p>
                <p>📝 Você pode anotar manualmente abaixo:</p>
                <input type="text" id="nome-identificado" placeholder="Digite o que você viu..." style="width:100%;padding:8px;margin-top:8px;">
            `;
        }
    } catch (erro) {
        resultado.innerHTML = `
            <p>⚠️ Sem conexão com a internet ou limite atingido.</p>
            <p>📝 Você pode anotar manualmente:</p>
            <input type="text" id="nome-identificado" placeholder="Digite o nome..." style="width:100%;padding:8px;margin-top:8px;">
        `;
    }
}

function mostrarResultado(resultados) {
    const resultado = document.getElementById('resultado-reconhecimento');
    let html = `<h4>✅ Encontrei isto:</h4>`;
    resultados.slice(0, 3).forEach((item, indice) => {
        const nome = item.species.commonNames[0] || item.species.scientificNameWithoutAuthor;
        const confianca = Math.round(item.score * 100);
        html += `
            <div style="padding:10px; background:#e8f5e9; border-radius:6px; margin:5px 0;">
                <strong>${indice + 1}.</strong> ${nome}
                <span style="color:green; float:right;">${confianca}% certeza</span>
                <button onclick="usarEsteResultado('${nome}')" style="margin-top:5px; padding:4px 8px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;">Usar este ✅</button>
            </div>
        `;
    });
    html += `<p style="margin-top:10px; font-size:12px; color:#666;">💡 Sempre confira com seu conhecimento também!</p>`;
    resultado.innerHTML = html;
}

function usarEsteResultado(nome) {
    alert(`✅ Anotado: "${nome}"\n\nAgora você pode registrar na sua aplicação!`);
}

function lerArquivoComoBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result.split(',')[1]);
        leitor.onerror = reject;
        leitor.readAsDataURL(arquivo);
    });
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('lista-frutas-conteudo')) {
        renderizarListaFrutas();
    }
});
