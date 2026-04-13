export function criarTimeline(root, config) {
    let paginaAtual = 1;

    const {
        label = null,
        dataset = [],
        itensPorPagina = 10,
    } = config;

    const totalPaginas = Math.ceil(dataset.length / itensPorPagina);

    root.innerHTML = "";

    // HEADER
    const header = document.createElement("div");
    header.className = "card-header";
    header.innerHTML = `<h5>${label}</h5>`;
    root.appendChild(header);

    // BODY
    const body = document.createElement("div");
    body.className = "card-body";

    const ul = document.createElement("ul");
    ul.className = "timeline";

    body.appendChild(ul);
    root.appendChild(body);

    const acoes = {
        insert: "adicionou",
        update: "editou",
        delete: "excluiu",
        login: "entrou",
        logout: "saiu"
    };

    // FOOTER
    const footer = document.createElement("div");
    footer.className = "card-footer d-flex justify-content-between align-items-center flex-wrap gap-2";

    const info = document.createElement("span");
    info.className = "text-muted";

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Paginação");

    const paginas = document.createElement("ul");
    paginas.className = "pagination mb-0";

    nav.appendChild(paginas);
    footer.appendChild(info);
    footer.appendChild(nav);

    root.appendChild(footer);

    function render() {
        ul.innerHTML = "";

        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const itensAtual = dataset.slice(inicio, fim);

        itensAtual.forEach(item => {
            const li = document.createElement("li");
            li.className = `timeline-item ${item.acao} mb-3`;

            const data = new Date(item.created_at).toLocaleString("pt-BR", {
                dateStyle: "medium",
                timeStyle: "short"
            });

            li.innerHTML = `
                <h5 class="mb-0">
                    <strong>${item.user_name}</strong> ${acoes[item.acao]} ${item.descricao}
                </h5>
                <span class="text-muted">${data}</span>
            `;

            ul.appendChild(li);
        });

        info.textContent = `Mostrando ${itensAtual.length} de ${dataset.length} registros`;
    }

    function pagination() {
        paginas.innerHTML = "";

        if (totalPaginas <= 1) return;

        for (let i = 1; i <= totalPaginas; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === paginaAtual ? "active" : ""}`;

            const a = document.createElement("a");
            a.className = "page-link";
            a.href = "#";
            a.textContent = i;

            a.onclick = (e) => {
                e.preventDefault();
                paginaAtual = i;
                render();
                pagination();
            };

            li.appendChild(a);
            paginas.appendChild(li);
        }
    }

    render();
    pagination();
}