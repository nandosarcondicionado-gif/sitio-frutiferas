document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();
  Sitio.seedCatalog();

  const $ = id => document.getElementById(id);

  function getMovements() {
    const list = Sitio.get('movimentos', []);
    return Array.isArray(list) ? list : [];
  }

  function addMovement(item, type, quantity, observation = '') {
    const movements = getMovements();

    movements.unshift({
      id: Sitio.id(),
      data: new Date().toISOString(),
      produto: item.nome,
      tipo: type,
      quantidade: quantity,
      unidade: item.unidade,
      obs: observation
    });

    Sitio.set('movimentos', movements);
  }

  function render() {
    const query = ($('filtro').value || '').toLocaleLowerCase('pt-BR');

    const items = Sitio.stock().filter(item =>
      String(item.nome || '').toLocaleLowerCase('pt-BR').includes(query)
    );

    $('lista').innerHTML = items.length
      ? items.map(item => `
          <article class="item">
            <h3>
              ${Sitio.esc(item.nome)}
              ${Number(item.qtd) <= Number(item.min || 0) ? '<span class="pill">Estoque baixo</span>' : ''}
            </h3>
            <p>
              Saldo: <strong>${Sitio.esc(item.qtd)} ${Sitio.esc(item.unidade)}</strong>
              • Mínimo: ${Sitio.esc(item.min || 0)}
              • Validade: ${Sitio.fmtDate(item.validade)}
            </p>
            <p class="muted">
              Lote: ${Sitio.esc(item.lote || 'Não informado')}
              ${item.obs ? ' • ' + Sitio.esc(item.obs) : ''}
            </p>
            <div class="actions">
              <button data-add="${Sitio.esc(item.id)}" class="secondary">Registrar entrada</button>
              <button data-use="${Sitio.esc(item.id)}">Registrar consumo</button>
              <button data-edit="${Sitio.esc(item.id)}" class="secondary">Ajustar saldo</button>
              <button data-del="${Sitio.esc(item.id)}" class="danger">Excluir</button>
            </div>
          </article>
        `).join('')
      : '<p class="empty">Nenhum produto encontrado no estoque.</p>';

    const movements = getMovements().slice(0, 30);

    $('movs').innerHTML = movements.length
      ? movements.map(movement => `
          <div class="item">
            <strong>${Sitio.esc(movement.tipo)}:</strong>
            ${Sitio.esc(movement.produto)} —
            ${Sitio.esc(movement.quantidade)} ${Sitio.esc(movement.unidade || '')}
            <div class="muted">
              ${Sitio.esc(new Date(movement.data).toLocaleString('pt-BR'))}
              ${Sitio.esc(movement.obs || '')}
            </div>
          </div>
        `).join('')
      : '<p class="muted">Nenhuma movimentação registrada.</p>';
  }

  $('form').addEventListener('submit', event => {
    event.preventDefault();

    const name = $('nome').value.trim();
    const quantity = Number($('qtd').value);
    const minimum = Number($('min').value || 0);

    if (!name) {
      Sitio.flash('Informe o nome do produto.', 'error');
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      Sitio.flash('Informe uma quantidade válida.', 'error');
      return;
    }

    if (!Number.isFinite(minimum) || minimum < 0) {
      Sitio.flash('Informe um estoque mínimo válido.', 'error');
      return;
    }

    const items = Sitio.stock();

    const item = {
      id: Sitio.id(),
      nome: name,
      qtd: quantity,
      unidade: $('unidade').value,
      min: minimum,
      validade: $('validade').value,
      lote: $('lote').value.trim(),
      obs: $('obs').value.trim()
    };

    items.push(item);
    Sitio.set('estoque', items);
    addMovement(item, 'Entrada inicial', quantity, 'Cadastro');

    event.target.reset();
    $('min').value = '0';
    render();
    Sitio.flash('Produto adicionado ao estoque.');
  });

  $('filtro').addEventListener('input', render);

  $('lista').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;

    const items = Sitio.stock();
    const targetId =
      button.dataset.use ||
      button.dataset.add ||
      button.dataset.edit ||
      button.dataset.del;

    const index = items.findIndex(item => String(item.id) === String(targetId));
    if (index < 0) return;

    const item = items[index];

    if (button.dataset.use || button.dataset.add) {
      const isConsumption = Boolean(button.dataset.use);

      const raw = prompt(
        (isConsumption ? 'Quantidade consumida' : 'Quantidade recebida') +
        ' (' + item.unidade + '):'
      );

      if (raw === null) return;

      const quantity = Number(raw);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        alert('Informe uma quantidade maior que zero.');
        return;
      }

      if (isConsumption && quantity > Number(item.qtd)) {
        alert('Saldo insuficiente.');
        return;
      }

      item.qtd = Number((
        Number(item.qtd) + (isConsumption ? -quantity : quantity)
      ).toFixed(4));

      items[index] = item;
      Sitio.set('estoque', items);

      addMovement(
        item,
        isConsumption ? 'Consumo' : 'Entrada',
        quantity
      );

      render();
      Sitio.flash('Saldo atualizado e movimentação registrada.');
      return;
    }

    if (button.dataset.edit) {
      const raw = prompt(
        'Novo saldo de ' + item.nome + ' (' + item.unidade + '):',
        item.qtd
      );

      if (raw === null) return;

      const quantity = Number(raw);

      if (!Number.isFinite(quantity) || quantity < 0) {
        alert('Saldo inválido.');
        return;
      }

      const previous = item.qtd;
      item.qtd = quantity;
      items[index] = item;

      Sitio.set('estoque', items);
      addMovement(item, 'Ajuste de saldo', quantity, 'Saldo anterior: ' + previous);

      render();
      Sitio.flash('Saldo ajustado.');
      return;
    }

    if (button.dataset.del) {
      if (!confirm('Excluir ' + item.nome + ' do estoque? O histórico de movimentações será preservado.')) return;

      items.splice(index, 1);
      Sitio.set('estoque', items);
      render();
      Sitio.flash('Produto removido do estoque.');
    }
  });

  $('exportar').addEventListener('click', () => {
    const data = {
      estoque: Sitio.stock(),
      movimentacoes: getMovements()
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-estoque-sitio-frutiferas.json';
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  render();
});
