import { mostrarMensagem, toggleButtonLoading } from "../util/ui.js";

import { criarTabela } from "../util/tables.js";
import { RelatoriosService } from "../services/relatorios.service.js";
import { registrarLog } from "../services/logs.service.js";

const tab = document.getElementById("relatorios");

export async function initRelatorios() {
  await carregarRelatorios();
  bindEvents();
}

// LISTAR
async function carregarRelatorios() {
  const card = tab.querySelector("#cardRelatorios");

  try {
    const { data, error } = await RelatoriosService.getAll();

    if (error) throw error;

    criarTabela(card, {
      header: {
        label: "Painel de Relatórios",
        insertButton: true,
        button_text: "Adicionar Relatório",
      },

      columns: [
        {
          title: "Título",
          field: "titulo",
          class: "fw-semibold text-truncate",
        },
        {
          title: "Data",
          field: "data_relatorio",
          type: "date",
        },
      ],

      actions: [
        {
          icon: "bi-file-earmark-pdf",
          class: "btn-primary",
          btnClass: "btn-visualizar",
        },
        {
          icon: "bi-trash",
          class: "btn-danger",
          btnClass: "btn-deletar",
        },
      ],

      dataset: data,
      itensPorPagina: 5,
      showIndex: true,
      tbodyId: "tabelaRelatorios",
    });
  } catch (err) {
    console.error("Erro ao carregar relatórios:", err);
    mostrarMensagem(tab, "Erro ao carregar relatórios");
  }
}

// EVENTOS
function bindEvents() {
  if (tab.dataset.eventsBound === "true") return;

  tab.addEventListener("click", handleClick);

  tab
    .querySelector("#confirmar-insert")
    ?.addEventListener("click", salvarRelatorio);

  tab
    .querySelector("#confirmar-delete")
    ?.addEventListener("click", confirmarDelete);

  tab.dataset.eventsBound = "true";
}

function handleClick(e) {
  if (e.target.closest("#btn-insert")) {
    return abrirModalInsert();
  }

  const visualizar = e.target.closest(".btn-visualizar");

  if (visualizar) {
    return visualizarRelatorio(visualizar.dataset.id);
  }

  const deletar = e.target.closest(".btn-deletar");

  if (deletar) {
    return abrirModalDelete(deletar.dataset.id);
  }
}

// INSERT
function abrirModalInsert() {
  const modal = tab.querySelector("#modalInsertRelatorio");

  if (!modal) {
    console.error("Modal de cadastro de relatórios não encontrado.");
    return;
  }

  modal.querySelectorAll("input").forEach((el) => {
    el.value = "";
  });

  new bootstrap.Modal(modal).show();
}

// GERAR NOME DO ARQUIVO
function gerarNomeArquivo(titulo, sufixo = 0) {
  let nome = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim()
    .replace(/[^a-zA-Z0-9 _-]/g, "") // Mantém letras, números, espaços, _ e -
    .replace(/\s+/g, " ") // Remove espaços duplicados
    .replace(/[. ]+$/g, "") // Remove pontos e espaços finais
    .replace(/\.pdf$/i, "");

  if (!nome) {
    nome = "Relatorio";
  }

  if (sufixo > 0) {
    nome += ` (${sufixo})`;
  }

  return `${nome}.pdf`;
}
// VERIFICAR CONFLITO DE NOME
function arquivoJaExiste(error) {
  return (
    error?.statusCode === "409" ||
    error?.status === 409 ||
    error?.error === "Duplicate" ||
    /already exists|duplicate/i.test(error?.message || "")
  );
}

// UPLOAD
async function salvarRelatorio(e) {
  const btn = e.currentTarget;
  const modal = tab.querySelector("#modalInsertRelatorio");

  if (!modal) {
    console.error("Modal de cadastro não encontrado.");
    return;
  }

  // Localizar campos
  const tituloInput = modal.querySelector("#tituloInput");
  const dataInput = modal.querySelector("#dataInput");
  const arquivoInput = modal.querySelector("#arquivoInput");

  if (!tituloInput || !dataInput || !arquivoInput) {
    console.error("Campos do modal não encontrados:", {
      tituloInput,
      dataInput,
      arquivoInput,
    });

    mostrarMensagem(tab, "Erro na estrutura do formulário de relatórios");

    return;
  }

  const titulo = tituloInput.value.trim();
  const data = dataInput.value;
  const arquivo = arquivoInput.files[0];

  // Validar campos
  if (!titulo || !data || !arquivo) {
    mostrarMensagem(tab, "Preencha todos os campos e selecione um PDF");
    return;
  }

  // Validar PDF
  const isPdfExtension = arquivo.name.toLowerCase().endsWith(".pdf");

  const isPdfMime = !arquivo.type || arquivo.type === "application/pdf";

  if (!isPdfExtension || !isPdfMime) {
    mostrarMensagem(tab, "Selecione um arquivo PDF válido");
    return;
  }

  // Limite de 20 MB
  if (arquivo.size > 20 * 1024 * 1024) {
    mostrarMensagem(tab, "O PDF deve ter no máximo 20 MB");
    return;
  }

  toggleButtonLoading(btn, true);

  let arquivoPath = null;
  let arquivoEnviado = false;
  let registroCriado = false;

  try {
    // 1. Gerar nome e enviar arquivo para o Storage
    let sufixo = 0;
    let uploadConcluido = false;

    while (!uploadConcluido) {
      arquivoPath = gerarNomeArquivo(titulo, sufixo);

      const { error: uploadError } = await RelatoriosService.upload(
        arquivo,
        arquivoPath,
      );

      if (!uploadError) {
        uploadConcluido = true;
        arquivoEnviado = true;
        continue;
      }

      // Se o nome já existir, tentar outro
      if (arquivoJaExiste(uploadError)) {
        sufixo++;
        continue;
      }

      throw uploadError;
    }

    // 2. Inserir metadados no banco
    const { error: insertError } = await RelatoriosService.create({
      titulo,
      data_relatorio: data,
      arquivo_path: arquivoPath,
    });

    if (insertError) throw insertError;

    registroCriado = true;

    // 3. Fechar modal
    bootstrap.Modal.getInstance(modal)?.hide();

    // 4. Atualizar tabela
    await carregarRelatorios();

    mostrarMensagem(tab, "Relatório enviado com sucesso!");

    // 5. Registrar log separadamente
    try {
      await registrarLog({
        acao: "insert",
        entidade: "relatorio",
      });
    } catch (logError) {
      console.error("Erro ao registrar log:", logError);
    }
  } catch (err) {
    console.error("Erro ao enviar relatório:", err);

    // Remover somente arquivos enviados por esta operação
    // e cujo registro não chegou a ser criado.
    if (arquivoEnviado && arquivoPath && !registroCriado) {
      const { error: deleteError } =
        await RelatoriosService.deleteFile(arquivoPath);

      if (deleteError) {
        console.error("Erro ao remover arquivo órfão:", deleteError);
      }
    }

    mostrarMensagem(tab, "Erro ao enviar relatório");
  } finally {
    toggleButtonLoading(btn, false);
  }
}

// VISUALIZAR
async function visualizarRelatorio(id) {
  // Abrir janela durante o clique para evitar bloqueio de popup
  const novaJanela = window.open("about:blank", "_blank");

  if (!novaJanela) {
    mostrarMensagem(tab, "Permita pop-ups para visualizar o PDF");
    return;
  }

  try {
    const { data, error } = await RelatoriosService.getById(id);

    if (error) throw error;

    const { data: urlData, error: urlError } =
      await RelatoriosService.getSignedUrl(data.arquivo_path);

    if (urlError) throw urlError;

    novaJanela.location.href = urlData.signedUrl;
  } catch (err) {
    console.error("Erro ao visualizar relatório:", err);

    novaJanela.close();

    mostrarMensagem(tab, "Erro ao abrir relatório");
  }
}

// DELETE
function abrirModalDelete(id) {
  const modal = tab.querySelector("#modalDeleteRelatorio");

  if (!modal) {
    console.error("Modal de exclusão não encontrado.");
    return;
  }

  const btn = modal.querySelector("#confirmar-delete");

  if (!btn) {
    console.error("Botão de confirmação de exclusão não encontrado.");
    return;
  }

  btn.dataset.id = id;

  new bootstrap.Modal(modal).show();
}

async function confirmarDelete(e) {
  const btn = e.currentTarget;
  const id = btn.dataset.id;

  if (!id) return;

  toggleButtonLoading(btn, true);

  try {
    // Buscar caminho do arquivo
    const { data, error } = await RelatoriosService.getById(id);

    if (error) throw error;

    // 1. Remover registro do banco
    const { error: deleteError } = await RelatoriosService.delete(id);

    if (deleteError) throw deleteError;

    // 2. Remover arquivo do Storage
    const { error: storageError } = await RelatoriosService.deleteFile(
      data.arquivo_path,
    );

    if (storageError) {
      console.error(
        "O registro foi excluído, mas o arquivo permaneceu no Storage:",
        storageError,
      );

      mostrarMensagem(
        tab,
        "Relatório excluído, mas houve um erro ao remover o PDF",
      );
    } else {
      mostrarMensagem(tab, "Relatório excluído!");
    }

    // Fechar modal
    bootstrap.Modal.getInstance(
      tab.querySelector("#modalDeleteRelatorio"),
    )?.hide();

    // Atualizar tabela
    await carregarRelatorios();

    // Registrar log
    try {
      await registrarLog({
        acao: "delete",
        entidade: "relatorio",
      });
    } catch (logError) {
      console.error("Erro ao registrar log:", logError);
    }
  } catch (err) {
    console.error("Erro ao excluir relatório:", err);
    mostrarMensagem(tab, "Erro ao excluir relatório");
  } finally {
    toggleButtonLoading(btn, false);
  }
}
