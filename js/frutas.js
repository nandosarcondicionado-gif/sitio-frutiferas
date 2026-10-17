
document.addEventListener("DOMContentLoaded", () => {
  Sitio.nav();

  const $ = (id) => document.getElementById(id);
  const form = $("formFruta");

  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  function limparFormulario() {
    form.reset();
    $("id").value = "";
  }

  // Reconhece variações dos nomes das nove culturas.
  function nomesDaCultura(nome) {
    const n = normalizar(nome);

    if (n.includes("pessego")) return ["pessego", "pessegueiro"];
    if (n.includes("morango")) return ["morango", "morangueiro"];
    if (n.includes("abacaxi")) return ["abacaxi", "abacaxizeiro"];
    if (n.includes("limao")) return ["limao", "limoeiro", "citros"];
    if (n.includes("lichia")) return ["lichia", "lichieira"];
    if (n.includes("maca")) return ["maca", "macieira"];
    if (n.includes("caqui")) return ["caqui", "caquizeiro"];
    if (n.includes("manga")) return ["manga", "mangueira"];
    if (n.includes("goiaba")) return ["goiaba", "goiabeira"];

    return [n];
  }

  // Só associa um produto quando o campo de cultura contém
  // uma indicação correspondente. Campo vazio não significa autorizado.
  function produtoAssociado(produto, fruta) {
    const cultura = normalizar(produto.cultura);
    if (!cultura) return false;

    const nomes = nomesDaCultura(fruta.nome);

    return cultura
      .split(";")
      .some((indicacao) => {
        const texto = normalizar(indicacao);

        return nomes.some((nome) => {
          if (!nome) return false;

          if (nome === "citros") {
            return (
              normalizar(fruta.nome).includes("limao") &&
              texto.includes("citros")
            );
          }

          return texto.includes(nome);
        });
      });
  }

  function mostrarProdutos(fruta) {
    const produtos = Sitio.products().filter((produto) =>
      produtoAssociado(produto, fruta)
    );

    if (!produtos.length) {
      return `
        <section class="notice">
          <strong>Produtos desta cultura</strong>
          <p>
            Ainda não há produtos associados a esta fruta no cadastro.
            Consulte a bula oficial antes de cadastrar uma indicação.
          </p>
          <a class="button secondary" href="defensivos.html">
            Abrir catálogo de produtos
          </a>
        </section>
      `;
    }

    return `
      <section class="card">
        <h4>🧪 Produtos associados a ${Sitio.esc(fruta.nome)}</h4>
        <p class="muted">
          Confira a situação de cada indicação. Uma associação cadastrada
          não substitui a confirmação da bula vigente.
        </p>

        ${produtos.map((produto) => {
          const status =
            produto.statusIndicacao || "Pendente de conferência";

          const confirmado =
            normalizar(status).includes("confirmado apos conferencia") ||
            normalizar(status).includes("confirmado na bula consultada");

          return `
            <article class="item">
              <h4>${Sitio.esc(produto.nome)}</h4>

              <p>
                <strong>Categoria:</strong>
                ${Sitio.esc(produto.categoria || "A confirmar")}
              </p>

              <p>
                <strong>Finalidade ou alvo:</strong>
                ${Sitio.esc(produto.alvo || "A confirmar na bula")}
              </p>

              <p>
                <strong>Cultura cadastrada:</strong>
                ${Sitio.esc(produto.cultura || "Não informada")}
              </p>

              <p>
                <strong>Dose:</strong>
                ${Sitio.esc(produto.dose || "Ainda não confirmada")}
              </p>

              <p>
                <strong>Modo de aplicação:</strong>
                ${Sitio.esc(
                  produto.modoAplicacao || "Ainda não informado"
                )}
              </p>

              <p>
                <strong>Situação:</strong>
                ${Sitio.esc(status)}
              </p>

              ${
                produto.registro
                  ? `<p><strong>Registro/referência:</strong>
                      ${Sitio.esc(produto.registro)}</p>`
                  : ""
              }

              ${
                produto.fonte
                  ? `<p><a href="${Sitio.esc(produto.fonte)}"
                      target="_blank" rel="noopener">
                      Consultar fonte cadastrada
                    </a></p>`
                  : ""
              }

              ${
                confirmado
                  ? `<p class="success notice">
                      A indicação está marcada como confirmada no cadastro.
                      Confira a bula vigente antes de aplicar.
                    </p>`
                  : `<p class="notice">
                      Indicação pendente de confirmação. Não use a dose
                      como recomendação até conferir a bula vigente.
                    </p>`
              }

              <div class="actions">
                <a class="button secondary"
                   href="defensivos.html?edit=${encodeURIComponent(
                     produto.id || produto.nome
                   )}">
                  Editar produto e indicação
                </a>
              </div>
            </article>
          `;
        }).join("")}
      </section>
    `;
  }

  function renderizar() {
    const busca = normalizar($("filtro").value);

    const frutas = Sitio.fruits().filter((fruta) =>
      normalizar(
        [
          fruta.nome,
          fruta.variedade,
          fruta.talhao,
          fruta.fase
        ].join(" ")
      ).includes(busca)
    );

    $("lista").innerHTML = frutas.length
      ? frutas.map((fruta) => `
          <article class="item">
            <h3>
              ${Sitio.esc(fruta.nome)}
              ${fruta.variedade
                ? " — " + Sitio.esc(fruta.variedade)
                : ""}
            </h3>

            <div class="muted">
              ${Sitio.esc(fruta.talhao || "Sem talhão")}
              • ${Sitio.esc(fruta.quantidade || "Quantidade não informada")}
              plantas
              • ${Sitio.esc(fruta.fase || "Fase não informada")}
            </div>

            <p>${Sitio.esc(fruta.obs || "Sem observações")}</p>

            <div class="actions">
              <button type="button" class="secondary"
                data-edit="${Sitio.esc(fruta.id)}">
                Editar cultura
              </button>

              <a class="button secondary"
                href="busca.html?fruta=${encodeURIComponent(fruta.id)}">
                Fotografar / diagnosticar
              </a>

              <button type="button" class="danger"
                data-del="${Sitio.esc(fruta.id)}">
                Excluir cultura
              </button>
            </div>

            ${mostrarProdutos(fruta)}
          </article>
        `).join("")
      : '<p class="empty">Nenhuma cultura encontrada.</p>';
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const frutas = Sitio.fruits();

    const fruta = {
      id: $("id").value || Sitio.id(),
      nome: $("nome").value.trim(),
      variedade: $("variedade").value.trim(),
      quantidade: $("quantidade").value,
      talhao: $("talhao").value.trim(),
      idade: $("idade").value.trim(),
      fase: $("fase").value,
      obs: $("obs").value.trim()
    };

    if (!fruta.nome) {
      Sitio.flash("Informe o nome da cultura.", "error");
      return;
    }

    const indice = frutas.findIndex(
      (item) => String(item.id) === String(fruta.id)
    );

    if (indice >= 0) {
      frutas[indice] = fruta;
    } else {
      frutas.push(fruta);
    }

    Sitio.set("frutas", frutas);
    limparFormulario();
    renderizar();
    Sitio.flash("Cultura salva com sucesso.");
  });

  $("lista").addEventListener("click", (evento) => {
    const editar = evento.target.closest("[data-edit]");
    const excluir = evento.target.closest("[data-del]");

    if (editar) {
      const fruta = Sitio.fruits().find(
        (item) => String(item.id) === String(editar.dataset.edit)
      );

      if (!fruta) return;

      $("id").value = fruta.id;
      $("nome").value = fruta.nome || "";
      $("variedade").value = fruta.variedade || "";
      $("quantidade").value = fruta.quantidade || "";
      $("talhao").value = fruta.talhao || "";
      $("idade").value = fruta.idade || "";
      $("fase").value = fruta.fase || "";
      $("obs").value = fruta.obs || "";

      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (excluir) {
      if (!confirm("Deseja excluir esta cultura?")) return;

      const frutas = Sitio.fruits().filter(
        (item) => String(item.id) !== String(excluir.dataset.del)
      );

      Sitio.set("frutas", frutas);
      renderizar();
      Sitio.flash("Cultura excluída.");
    }
  });

  $("limpar").addEventListener("click", limparFormulario);
  $("filtro").addEventListener("input", renderizar);

  renderizar();
});
