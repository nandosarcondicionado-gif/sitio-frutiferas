document.addEventListener('DOMContentLoaded', () => {
  Sitio.nav();
  Sitio.renderFruitSelects();

  const $ = id => document.getElementById(id);
  $('data').value = Sitio.dateNow();

  $('form').addEventListener('submit', event => {
    event.preventDefault();

    if (!$('confirmacao').checked) {
      Sitio.flash(
        'Confirme que verificou a bula e as medidas de segurança antes de registrar.',
        'error'
      );
      return;
    }

    const cultureSelect = $('fruta');
    if (!cultureSelect.value) {
      Sitio.flash('Selecione a cultura.', 'error');
      return;
    }

    const records = Sitio.apps();

    records.unshift({
      id: Sitio.id(),
      fruta: cultureSelect.selectedOptions[0].text,
      frutaId: cultureSelect.value,
      produto: $('produto').value.trim(),
      quantidade: $('qtd').value,
      unidade: $('unidade').value,
      area: $('area').value.trim(),
      data: $('data').value,
      motivo: $('motivo').value.trim(),
      responsavel: $('responsavel').value.trim(),
      carencia: $('carencia').value.trim(),
      obs: $('obs').value.trim(),
      createdAt: new Date().toISOString()
    });

    Sitio.set('aplicacoes', records);
    event.target.reset();
    $('data').value = Sitio.dateNow();
    Sitio.flash('Registro salvo no histórico deste navegador.');
  });
});
