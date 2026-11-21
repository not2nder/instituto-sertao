const loading = {
  dashboard: false,
  noticias: false,
  projetos: false,
  relatorios: false,
  auditoria: false,
};

const initialized = {
  dashboard: false,
  noticias: false,
  projetos: false,
  relatorios: false,
  auditoria: false,
};

const modules = {
  "#dashboard": {
    name: "dashboard",
    path: "./modules/dashboard.js",
    init: "initDashboard",
  },
  "#noticias": {
    name: "noticias",
    path: "./modules/noticias.js",
    init: "initNoticias",
  },
  "#projetos": {
    name: "projetos",
    path: "./modules/projetos.js",
    init: "initProjetos",
  },
  "#relatorios": {
    name: "relatorios",
    path: "./modules/relatorios.js",
    init: "initRelatorios",
  },
  "#auditoria": {
    name: "auditoria",
    path: "./modules/auditoria.js",
    init: "initAuditoria",
  },
};

export function initTabs() {
  const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');

  tabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", async (e) => {
      const target = e.target.getAttribute("data-bs-target");
      const moduleConfig = modules[target];

      if (!moduleConfig) return;

      const { name, path, init } = moduleConfig;

      if (initialized[name] || loading[name]) return;

      loading[name] = true;

      try {
        const module = await import(path);
        await module[init]();

        initialized[name] = true;
      } catch (err) {
        console.error(`Erro ao carregar aba ${name}:`, err);
      } finally {
        loading[name] = false;
      }
    });
  });
}
