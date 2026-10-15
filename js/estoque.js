document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();

  const $ = id => document.getElementById(id);

  function getMov() {
    return Sitio.get('movimentos', []);
  }

  function mov(item, tipo, quantidade, obs = '') {
    const movements = getMov();

    movements.unshift({
      id: Sitio.id(),
      data: new Date().toISOString(),
      produto: item.nome,
      tipo,
      quantidade,
      unidade: item.unidade,
      obs
    });

    Sitio.set('movimentos', movements);
  }

  function render() {
    const query = $('filtro').value.toLowerCase();

    const items = Sitio.stock().filter(item =>
      item.nome.toLowerCase().includes(query)
    );

    $('lista').innerHTML = items.length
      ? items.map(item => `
        <article class="item">
          <h3>${Sitio.esc(item.nome)}
            ${Number(item.qtd) <= Number(item.min || 0)
              ? '<span class="pill">Estoque baixo</span>' : ''}
          </h3>
          <p>Saldo: <strong>${Sitio.esc(item.qtd)} ${Sitio.esc(item.unidade)}</strong>
            • Mínimo: ${Sitio.esc(item.min || 0)}
            • Validade: ${Sitio.fmtDate(item.validade)}
          </p>
          <p class="muted">
            Lote: ${Sitio.esc(item.lote || 'Não informado')}
            ${item.obs ? '• ' + Sitio.esc(item.obs) : ''}
          </p>
          <div class="actions">
            <button data-add="${Sitio.esc(item.id)}" class="secondary">Registrar entrada</button>
            <button data-use="${Sitio.esc(item.id)}">Registrar consumo</button>
            <button data-edit="${Sitio.esc(item.id)}" class="secondary">Ajustar saldo</button>
            <button data-del="${Sitio.esc(item.id)}" class="danger">Excluir</button>
          </div>
        </article>
      `).join('')
      : '<p class="empty">Nenhum produto cadastrado.</p>';

    const movements = getMov().slice(0, 30);

    $('movs').innerHTML = movements.length
      ? movements.map(m => `
        <div class="item">
          <strong>${Sitio.esc(m.tipo)}:</strong>
          ${Sitio.esc(m.produto)} —
          ${Sitio.esc(m.quantidade)} ${Sitio.esc(m.unidade || '')}
          <div class="muted">
            ${new Date(m.data).toLocaleString('pt-BR')}
            ${Sitio.esc(m.obs || '')}
          </div>
        </div>
      `).join('')
      : '<p class="muted">Nenhuma movimentação registrada.</p>';
  }

  $('form').onsubmit = event => {
    event.preventDefault();

    const items = Sitio.stock();

    const item = {
      id: Sitio.id(),
      nome: $('nome').value.trim(),
      qtd: Number($('qtd').value),
      unidade: $('unidade').value,
      min: Number($('min').value || 0),
      validade: $('validade').value,
      lote: $('lote').value.trim(),
      obs: $('obs').value.trim()
    };

    items.push(item);
    Sitio.set('estoque', items);
    mov(item, 'Entrada inicial', item.qtd, 'Cadastro');

    event.target.reset();
    $('min').value = '0';

    render();
    Sitio.flash('Produto adicionado ao estoque.');
  };

  $('filtro').oninput = render;

  $('lista').onclick = event => {
    const button = event.target.closest('button');
    if (!button) return;

    const items = Sitio.stock();

    const index = items.findIndex(item =>
      item.id === button.dataset.use ||
      item.id === button.dataset.add ||
      item.id === button.dataset.edit ||
      item.id === button.dataset.del
    );

    if (index < 0) return;

    const item = items[index];

    if (button.dataset.use || button.dataset.add) {
      const isUse = Boolean(button.dataset.use);

      const value = prompt(
        (isUse ? 'Quantidade consumida' : 'Quantidade recebida') +
        ' (' + item.unidade + '):'
      );

      if (value === null) return;

      const quantity = Number(value);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        alert('Informe uma quantidade maior que zero.');
        return;
      }

      if (isUse && quantity > Number(item.qtd)) {
        alert('Saldo insuficiente.');
        return;
      }

      item.qtd = Number(
        (Number(item.qtd) + (isUse ? -quantity : quantity)).toFixed(4)
      );

      items[index] = item;
      Sitio.set('estoque', items);

      mov(item, isUse ? 'Consumo' : 'Entrada', quantity);
      render();
      Sitio.flash('Saldo atualizado e movimentação registrada.');

    } else if (button.dataset.edit) {
      const value = prompt(
        'Novo saldo de ' + item.nome + ' (' + item.unidade + '):',
        item.qtd
      );

      if (value === null) return;

      const quantity = Number(value);

      if (!Number.isFinite(quantity) || quantity < 0) {
        alert('Saldo inválido.');
        return;
      }

      const previous = item.qtd;
      item.qtd = quantity;

      items[index] = item;
      Sitio.set('estoque', items);

      mov(item, 'Ajuste de saldo', quantity, 'Saldo anterior: ' + previous);
      render();

    } else if (confirm('Excluir ' + item.nome + ' do estoque? O histórico de movimentações será preservado.')) {
      items.splice(index, 1);
      Sitio.set('estoque', items);
      render();
      Sitio.flash('Produto removido.');
    }
  };

  $('exportar').onclick = () => {
    const data = {
      estoque: Sitio.stock(),
      movimentacoes: getMov()
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-estoque-sitio-frutiferas.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  render();
});
