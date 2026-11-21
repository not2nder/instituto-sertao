import { supabaseClient } from "../api.js";

const container = document.getElementById("relatorios-lista");

async function listarRelatoriosPublicos() {
  try {
    const { data, error } = await supabaseClient.storage.from("files").list("");

    if (error) {
      throw error;
    }

    // Ignora objetos internos e exibe somente arquivos PDF.
    const arquivos = data.filter(
      (arquivo) =>
        arquivo.name !== ".emptyFolderPlaceholder" &&
        arquivo.name.toLowerCase().endsWith(".pdf"),
    );

    console.log(arquivos);

    container.innerHTML = "";

    arquivos.forEach((arquivo) => {
      const url = `https://jgbqolgtvagblvwrrydh.supabase.co/storage/v1/object/public/files/${encodeURIComponent(arquivo.name)}`;

      const pdfElement = document.createElement("li");
      pdfElement.classList.add("col-12");

      pdfElement.innerHTML = `
        <a href="${url}"
           target="_blank"
           rel="noopener noreferrer"
           class="btn btn-outline-success btn-lg w-100 d-flex justify-content-center align-items-center">
          <i class="bi bi-file-earmark-pdf-fill me-2"></i>
          ${arquivo.name}
        </a>
      `;

      container.appendChild(pdfElement);
    });
  } catch (error) {
    console.error("Erro ao listar relatórios:", error);
  }
}

listarRelatoriosPublicos();
