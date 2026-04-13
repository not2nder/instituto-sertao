export function criarTabela(root, config){
    let paginaAtual = 1;

    const {
        header = {},
        columns = [],
        dataset = [],
        itensPorPagina = 10,
        tbodyId = null,
        actions = null,
        showIndex = false
    } = config;

    const totalPaginas = Math.ceil(dataset.length/itensPorPagina);

    root.innerHTML = "";

    const cardHeader = document.createElement("card-header");
    cardHeader.className = "card-header d-flex justify-content-between";
    cardHeader.innerHTML = `<h5>${header.label}</h5>`;

    const insertButton = document.createElement("button");
    insertButton.className = "btn btn-insert";
    insertButton.innerHTML = `${header.button_text} <i class="bi bi-plus-circle"></i>`;
    insertButton.id = "btn-insert";
    cardHeader.appendChild(insertButton);
    root.appendChild(cardHeader);

    //CARD BODY
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    //RESPONSIVE
    const responsive = document.createElement("div");
    responsive.className = "table-responsive";

    //TABELA
    const tabela = document.createElement("table");
    tabela.style.tableLayout = "fixed";
    tabela.style.width = "100%";
    tabela.className = "table table-hover align-middle table-bordered m-0";

    // THEAD
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    
    // INDEX
    if(showIndex) {
        const th = document.createElement("th");
        th.textContent = "#";
        th.className = "text-center fw-bold"
        th.style.width = "40px";
        trHead.appendChild(th);
    }

    columns.forEach(col => {
        const th = document.createElement("th");
        if(col.type === "image") {
            th.style.width = "165px"
        }
        th.scope = "col";
        th.textContent = col.title;

        trHead.appendChild(th);
    });

    // ACTIONS
    if(actions) {
        const th = document.createElement("th");
        th.textContent = "Ações";
        th.className = "text-center";
        th.style.width = "150px";
        trHead.appendChild(th);
    }

    thead.appendChild(trHead);
    tabela.appendChild(thead);

    // TBODY
    const tbody = document.createElement("tbody");
    if(tbodyId) tbody.id = tbodyId;
    tabela.appendChild(tbody);

    // FOOTER + PAGINAÇÃO
    const footer = document.createElement("div");
    footer.className = "card-footer d-flex justify-content-between align-items-center flex-wrap gap-2";
    const info = document.createElement("span");
    info.className = "text-muted"
    footer.appendChild(info)

    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Paginação")

    const ul = document.createElement("ul");
    ul.className = "pagination mb-0";

    nav.appendChild(ul);
    footer.appendChild(nav);

    responsive.appendChild(tabela);
    cardBody.appendChild(responsive);

    root.appendChild(cardBody);
    root.appendChild(footer)

    function render() {
        tbody.innerHTML = "";

        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const itensAtual = dataset.slice(inicio, fim);

        itensAtual.forEach((item, index) => {
            const tr = document.createElement("tr");

            //INDEX
            if (showIndex) {
                const td = document.createElement("td");
                td.className = "text-center fw-bold";

                td.textContent = (paginaAtual-1)*itensPorPagina + index + 1;
                tr.appendChild(td)
            }

            // COLUNAS
            columns.forEach(col => {
                const td = document.createElement("td");

                td.className = col.class?col.class: "";

                let value = item[col.field];

                if (!col.type) td.textContent = value ?? "";

                if (col.type === "image") {
                    if(Array.isArray(value)) value = value[0];

                    if (!value) value = "../../assets/img/default.png";

                    td.innerHTML = `
                        <div class="table-img-wrapper">
                            <img src="${value}" class="table-img">
                        </div>
                    `;
                }

                if (col.type === "date") td.textContent = new Date(value).toLocaleDateString();
                
                tr.appendChild(td)
            });

            if (actions) {
                const td = document.createElement("td");
                td.className = "text-center";

                const container = document.createElement("div");
                container.className = "d-flex justify-content-center gap-2";

                actions.forEach(action => {
                    const btn = document.createElement("button");

                    btn.className = `btn btn-sm ${action.btnClass} ${action.class}`;
                    btn.dataset.id = item.id;

                    btn.innerHTML = `<i class="bi ${action.icon}"></i>`;

                    container.appendChild(btn);
                });

                td.appendChild(container);
                tr.appendChild(td);
            }

            tbody.appendChild(tr)
        });
        
        info.textContent = `Mostrando ${itensAtual.length} de ${dataset.length} registros`;
    }

    function pagination() {
        ul.innerHTML = "";

        for (let i = 1; i <= totalPaginas; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i==paginaAtual? "active": ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`

            li.onclick = (e) => {
                e.preventDefault();
                paginaAtual = i;
                render();
                pagination();
            }

            ul.appendChild(li);
        }
    }

    render();
    pagination();
}