let loading = {
    dashbaord: false,
    noticias: false,
    projetos: false,
    auditoria: false
}

export function initTabs() {
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');

    tabs.forEach(tab => {
        tab.addEventListener("shown.bs.tab", async (e) => {
            const target = e.target.getAttribute("data-bs-target");

            if (target === "#noticias" && !loading.noticias) {
                loading.noticias = true;

                const module = await import("./modules/noticias.js")
                module.initNoticias();

                loading.noticias = false;
            }
            else if (target === "#dashboard" && !loading.dashbaord) {
                loading.dashbaord = true;

                const module = await import("./modules/dashboard.js");
                module.initDashboard();

                loading.dashbaord = false;
            }
            else if (target === "#projetos" && !loading.projetos) {
                loading.projetos = true;

                const module = await import("./modules/projetos.js");
                module.initProjetos();

                loading.projetos = false;
            }
            else if (target === "#auditoria" && !loading.auditoria) {
                loading.auditoria = true;

                const module = await import("./modules/auditoria.js");
                module.initAuditoria();

                loading.auditoria = false;
            }
        });
    });
}