document.addEventListener('DOMContentLoaded', () => {
  Sitio.navHome();

  document.getElementById('nfrutas').textContent =
    Sitio.fruits().length;

  document.getElementById('napps').textContent =
    Sitio.apps().length;

  document.getElementById('ndiag').textContent =
    Sitio.diagnoses().length;

  document.getElementById('nprod').textContent =
    Sitio.stock().length;
});
