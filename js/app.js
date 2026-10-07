// ==========================================
// SÍTIO FRUTÍFERAS — Controle de Defensivos
// Versão 1.0
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
    { id: 1, nome: 'Pêssego', quantidade: '', talhao: '', obs: '' },
    { id: 2, nome: 'Abacaxi', quantidade: '', talhao: '', obs: '' },
    { id: 3, nome: 'Morango', quantidade: '', talhao: '', obs: '' },
    { id: 4, nome: 'Limão', quantidade: '', talhao: '', obs: '' },
    { id: 5, nome: 'Goiaba', quantidade: '', talhao: '', obs: '' },
    { id: 6, nome: 'Lichia', quantidade: '', talhao: '', obs: '' }
]);
let defensivos = carregarDados('defensivos', []);
let estoque = carregarDados('estoque', []);
let historico = carregarDados('historico', []);
let galeria = carregarDados('galeria', []);
let duvidas = carregarDados('duvidas', []);

let editandoFrutaId = null;

// ========== NAVEGAÇÃO ==========
function mostrarSecao(id) {
    document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.querySelector('.menu-principal').style.display = 'none';
    document.getElementById('btn-voltar').style.display = 'block';
    
    if (id === 'frutas') renderizarFrutas();
    if (id === 'defensivos') renderizarDefensivos();
    if (id === 'aplicar') preencherSeletoresAplicacao();
    if (id === 'estoque') renderizarEstoque();
    if (id === 'historico') renderizarHistorico();
    if (id === 'galeria') renderizarGaleria();
    if (id === 'ajuda') {}
}

function voltarInicio() {
    document.querySelectorAll('.secao').forEach(s => s.style.display = 'none');
    document.querySelector('.menu-principal').style.display = 'flex';
    document.getElementById('btn-voltar').style.display = 'none';
}

// ========== FRUTAS ==========
function renderizarFrutas() {
    const lista = document.getElementById('lista-frutas');
    if (frutas.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhuma fruta cadastrada ainda. Clique em "+ Nova Fruta" para começar!</p>';
        return;
    }
    lista.innerHTML = frutas.map(f => `
        <div class="item">
            <div class="item-titulo">${f.nome}</div>
            ${f.quantidade ? `<p>🌳 Quantidade: ${f.quantidade} pés</p>` : ''}
            ${f.talhao ? `<p>📍 Local/Talhão: ${f.talhao}</p>` : ''}
            ${f.obs ? `<p>📝 Obs: ${f.obs}</p>` : ''}
            <div class="item-acoes">
                <button class="btn-pequeno btn-editar" onclick="editarFruta(${f.id})">✏️ Editar</button>
                <button class="btn-pequeno btn-excluir" onclick="excluirFruta(${f.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

function abrirModalFruta(id = null) {
    editandoFrutaId = id;
    document.getElementById('modal-fruta').style.display = 'block';
    document.getElementById('titulo-modal-fruta').textContent = id ? 'Editar Fruta' : 'Adicionar Nova Fruta';
    
    if (id) {
        const f = frutas.find(x => x.id === id);
        document.getElementById('fruta-nome').value = f.nome;
        document.getElementById('fruta-quantidade').value = f.quantidade || '';
        document.getElementById('fruta-talhao').value = f.talhao || '';
        document.getElementById('fruta-obs').value = f.obs || '';
    } else {
        document.getElementById('fruta-nome').value = '';
        document.getElementById('fruta-quantidade').value = '';
        document.getElementById('fruta-talhao').value = '';
        document.getElementById('fruta-obs').value = '';
    }
}

function fecharModal(nome) {
    document.getElementById(`modal-${nome}`).style.display = 'none';
    editandoFrutaId = null;
}

function salvarFruta() {
    const nome = document.getElementById('fruta-nome').value.trim();
    if (!nome) { alert('Digite o nome da fruta!'); return; }
    
    const dados = {
        nome,
        quantidade: document.getElementById('fruta-quantidade').value,
        talhao: document.getElementById('fruta-talhao').value,
        obs: document.getElementById('fruta-obs').value
    };
    
    if (editandoFrutaId) {
        const idx = frutas.findIndex(f => f.id === editandoFrutaId);
        frutas[idx] = { ...frutas[idx], ...dados };
    } else {
        frutas.push({ id: Date.now(), ...dados });
    }
    
    salvarDados('frutas', frutas);
    fecharModal('fruta');
    renderizarFrutas();
}

function editarFruta(id) {
    abrirModalFruta(id);
}

function excluirFruta(id) {
    if (confirm('Tem certeza que deseja excluir essa fruta?')) {
        frutas = frutas.filter(f => f.id !== id);
        salvarDados('frutas', frutas);
        renderizarFrutas();
    }
}

// ========== CALCULADORA ==========
function calcularDose() {
    const litros = parseFloat(document.getElementById('calc-litros').value);
    const dose = parseFloat(document.getElementById('calc-dose').value);
    
    if (!litros || !dose) {
        document.getElementById('resultado-calculo').innerHTML = '';
        return;
    }
    
    const total = litros * dose;
    document.getElementById('resultado-calculo').innerHTML = 
        `✅ Use <strong>${total.toFixed(1)} ml</strong> do produto para ${litros} litros de calda`;
}

// ========== DEFENSIVOS ==========
function abrirModalDefensivo() {
    document.getElementById('modal-defensivo').style.display = 'block';
    document.getElementById('def-nome').value = '';
    document.getElementById('def-dose').value = '';
    document.getElementById('def-carencia').value = '';
    document.getElementById('def-unidade').value = 'ml';
    document.getElementById('def-quantidade').value = '';
}

function salvarDefensivo() {
    const nome = document.getElementById('def-nome').value.trim();
    const dose = parseFloat(document.getElementById('def-dose').value);
    const carencia = document.getElementById('def-carencia').value;
    const unidade = document.getElementById('def-unidade').value;
    const quantidade = parseFloat(document.getElementById('def-quantidade').value);
    
    if (!nome || !dose) { alert('Preencha nome e dose!'); return; }
    
    const produto = {
        id: Date.now(),
        nome,
        dose,
        carencia: carencia || 'Não informado',
        unidade,
        quantidade: quantidade || 0
    };
    
    defensivos.push(produto);
    estoque.push({
        id: Date.now(),
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: produto.quantidade,
        unidade: produto.unidade,
        data: new Date().toLocaleDateString('pt-BR')
    });
    
    salvarDados('defensivos', defensivos);
    salvarDados('estoque', estoque);
    fecharModal('defensivo');
    renderizarDefensivos();
}

function renderizarDefensivos() {
    const lista = document.getElementById('lista-defensivos');
    if (defensivos.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhum produto cadastrado ainda. Clique em "+ Novo Produto" para começar!</p>';
        return;
    }
    lista.innerHTML = defensivos.map(d => `
        <div class="item">
            <div class="item-titulo">🧪 ${d.nome}</div>
            <p>📊 Dose: ${d.dose} ml por litro de água</p>
            <p>⏳ Carência: ${d.carencia} dias</p>
            <p>📦 Estoque: ${d.quantidade} ${d.unidade}</p>
            <div class="item-acoes">
                <button class="btn-pequeno btn-excluir" onclick="excluirDefensivo(${d.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

function excluirDefensivo(id) {
    if (confirm('Excluir esse produto?')) {
        defensivos = defensivos.filter(d => d.id !== id);
        estoque = estoque.filter(e => e.produtoId !== id);
        salvarDados('defensivos', defensivos);
        salvarDados('estoque', estoque);
        renderizarDefensivos();
    }
}

// ========== APLICAR ==========
function preencherSeletoresAplicacao() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('aplicar-data').value = hoje;
    
    const selFruta = document.getElementById('aplicar-fruta');
    selFruta.innerHTML = '<option value="">— Selecione uma fruta —</option>' + 
        frutas.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
    
    const selProduto = document.getElementById('aplicar-produto');
    selProduto.innerHTML = '<option value="">— Selecione um produto —</option>' + 
        defensivos.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
    
    const selProdEntrada = document.getElementById('entrada-produto');
    selProdEntrada.innerHTML = '<option value="">— Selecione um produto —</option>' + 
        defensivos.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
    
    const selFotoFruta = document.getElementById('foto-fruta');
    selFotoFruta.innerHTML = '<option value="">— Nenhuma / Geral —</option>' + 
        frutas.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
}

function registrarAplicacao() {
    const frutaId = document.getElementById('aplicar-fruta').value;
    const produtoId = document.getElementById('aplicar-produto').value;
    const data = document.getElementById('aplicar-data').value;
    const calda = parseFloat(document.getElementById('aplicar-calda').value);
    const obs = document.getElementById('aplicar-obs').value;
    
    if (!frutaId || !produtoId || !calda) {
        alert('Preencha fruta, produto e quantidade de calda!');
        return;
    }
    
    const fruta = frutas.find(f => f.id == frutaId);
    const produto = defensivos.find(d => d.id == produtoId);
    const quantidadeUsada = calda * produto.dose;
    
    historico.unshift({
        id: Date.now(),
        data: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR'),
        fruta: fruta.nome,
        produto: produto.nome,
        calda,
        quantidadeUsada,
        unidade: produto.unidade,
        obs
    });
    
    // Atualizar estoque
    const idxEstoque = defensivos.findIndex(d => d.id == produtoId);
    if (idxEstoque !== -1) {
        defensivos[idxEstoque].quantidade = parseFloat(defensivos[idxEstoque].quantidade) - quantidadeUsada;
    }
    
    salvarDados('historico', historico);
    salvarDados('defensivos', defensivos);
    
    document.getElementById('aplicar-calda').value = '';
    document.getElementById('aplicar-obs').value = '';
    
    alert(`✅ Aplicação registrada!\nUsado: ${quantidadeUsada.toFixed(1)} ${produto.unidade} de ${produto.nome}`);
    mostrarSecao('historico');
}

// ========== ESTOQUE ==========
function abrirModalEntrada() {
    preencherSeletoresAplicacao();
    document.getElementById('modal-entrada').style.display = 'block';
    document.getElementById('entrada-data').value = new Date().toISOString().split('T')[0];
    document.getElementById('entrada-quantidade').value = '';
}

function salvarEntrada() {
    const produtoId = document.getElementById('entrada-produto').value;
    const quantidade = parseFloat(document.getElementById('entrada-quantidade').value);
    
    if (!produtoId || !quantidade) { alert('Preencha produto e quantidade!'); return; }
    
    const idx = defensivos.findIndex(d => d.id == produtoId);
    if (idx !== -1) {
        defensivos[idx].quantidade = parseFloat(defensivos[idx].quantidade) + quantidade;
        salvarDados('defensivos', defensivos);
    }
    
    fecharModal('entrada');
    renderizarEstoque();
    alert('✅ Estoque atualizado!');
}

function renderizarEstoque() {
    const lista = document.getElementById('lista-estoque');
    if (defensivos.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhum produto cadastrado ainda.</p>';
        return;
    }
    lista.innerHTML = defensivos.map(d => {
        const baixo = parseFloat(d.quantidade) < 100 && d.unidade === 'ml';
        return `
        <div class="item">
            <div class="item-titulo">🧪 ${d.nome}</div>
            <p>📦 Saldo: <strong>${d.quantidade} ${d.unidade}</strong> ${baixo ? '<span class="aviso-baixo">⚠️ Estoque Baixo!</span>' : ''}</p>
            <p>📊 Dose padrão: ${d.dose} ml/L</p>
            <p>⏳ Carência: ${d.carencia} dias</p>
        </div>
    `}).join('');
}

// ========== HISTÓRICO ==========
function renderizarHistorico() {
    const lista = document.getElementById('lista-historico');
    if (historico.length === 0) {
        lista.innerHTML = '<p class="sem-dados">Nenhuma aplicação registrada ainda.</p>';
        return;
    }
    lista.innerHTML = historico.map(h => `
        <div class="item">
            <div class="item-titulo">📅 ${h.data}</div>
            <p>🍃 Fruta: ${h.fruta}</p>
            <p>🧪 Produto: ${h.produto}</p>
            <p>💧 Calda preparada: ${h.calda} L</p>
            <p>📊 Usado: ${h.quantidadeUsada.toFixed(1)} ${h.unidade}</p>
            ${h.obs ? `<p>📝 ${h.obs}</p>` : ''}
        </div>
    `).join('');
}

// ========== GALERIA DE FOTOS ==========
function abrirModalFoto() {
    preencherSeletoresAplicacao();
    document.getElementById('modal-foto').style.display = 'block';
    document.getElementById('foto-descricao').value = '';
    document.getElementById('preview-imagem').style.display = 'none';
}

function previewFoto(input) {
    const preview = document.getElementById('preview-imagem');
    if (input.files && input.files[0]) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        leitor.readAsDataURL(input.files[0]);
    }
}

function salvarFoto() {
    const arquivo = document.getElementById('input-foto').files[0];
    if (!arquivo) { alert('Selecione uma foto!'); return; }
    
    const tipo = document.getElementById('foto-tipo').value;
    const frutaSel = document.getElementById('foto-fruta');
    const frutaNome = frutaSel.value ? frutaSel.options[frutaSel.selectedIndex].text : '';
    const descricao = document.getElementById('foto-descricao').value;
    
    const leitor = new FileReader();
    leitor.onload = function(e) {
        galeria.unshift({
            id: Date.now(),
            imagem: e.target.result,
            tipo,
            fruta: frutaNome,
            descricao,
            data: new Date().toLocaleDateString('pt-BR')
        });
        salvarDados('galeria', galeria);
        fecharModal('foto');
        renderizarGaleria();
        document.getElementById('input-foto').value = '';
        document.getElementById('preview-imagem').style.display = 'none';
    };
    leitor.readAsDataURL(arquivo);
}

function renderizarGaleria() {
    const lista = document.getElementById('lista-fotos');
    if (galeria.length === 0) {
        lista.innerHTML = '<p class="sem-dados" style="grid-column:1/-1">Nenhuma foto salva ainda.</p>';
        return;
    }
    lista.innerHTML = galeria.map(g => `
        <div class="foto-item">
            <img src="${g.imagem}" alt="${g.descricao}">
            <div class="foto-info">
                <strong>${g.tipo === 'veneno' ? '🧪' : g.tipo === 'praga' ? '🐛' : g.tipo === 'aplicacao' ? '📅' : '📷'} ${g.data}</strong>
                ${g.fruta ? `<br>🍃 ${g.fruta}` : ''}
                ${g.descricao ? `<br>${g.descricao.substring(0,20)}...` : ''}
            </div>
        </div>
    `).join('');
}

// ========== DÚVIDAS ==========
function abrirModalDuvida() {
    document.getElementById('modal-duvida').style.display = 'block';
    document.getElementById('duvida-texto').value = '';
    renderizarDuvidas();
}

function salvarDuvida() {
    const texto = document.getElementById('duvida-texto').value.trim();
    if (!texto) return;
    
    duvidas.unshift({
        id: Date.now(),
        texto,
        data: new Date().toLocaleDateString('pt-BR')
    });
    salvarDados('duvidas', duvidas);
    document.getElementById('duvida-texto').value = '';
    renderizarDuvidas();
    alert('✅ Dúvida salva!');
}

function renderizarDuvidas() {
    const lista = document.getElementById('lista-duvidas');
    if (duvidas.length === 0) return;
    lista.innerHTML = '<h4 style="margin-top:15px">📝 Minhas Dúvidas:</h4>' + 
        duvidas.map(d => `
            <div style="padding:8px; background:#f5f5f5; border-radius:4px; margin-top:5px;">
                <small>${d.data}</small>
                <p>${d.texto}</p>
            </div>
        `).join('');
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌳 Sítio Frutíferas — Sistema carregado com sucesso!');
});

// Fechar modais clicando fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}
