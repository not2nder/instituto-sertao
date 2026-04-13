import { mostrarMensagem, toggleButtonLoading } from "../util/ui.js";
import { criarTabela } from "../util/tables.js";
import { slug } from "../util/slug.js";
import { uploadImagem, deleteImagem } from "../services/upload.service.js";
import { NoticiasService } from "../services/noticias.service.js";
import { registrarLog } from "../services/logs.service.js";

const tab = document.getElementById("noticias");

export async function initNoticias() {
    await carregarNoticias();
    bindEvents();
}

async function carregarNoticias() {
    const card = tab.querySelector("#cardTabela");

    try {
        const { data, error } = await NoticiasService.getAll();
        if (error) throw error;

        criarTabela(card, {
            header: {
                label: "Painel de Projetos",
                insertButton: true,
                button_text: "Inserir Notícia"
            },
            columns: [
                {title: "Imagem", field: "noticia_imagem", type: "image"},
                {title: "Título", field: "titulo", class: "fw-semibold text-truncate"},
                {title: "Subtítulo", field: "subtitulo", class: "text-muted text-truncate"},
                {title: "Descrição", field: "descricao", class: "text-muted text-truncate"},
                {title: "Data", field: "data_noticia", type: "date"}
            ],
            actions: [
                {icon: "bi-pencil", class: "btn-primary", btnClass: "btn-editar"},
                {icon: "bi-trash", class: "btn-danger", btnClass: "btn-deletar"},
            ],
            dataset: data,
            itensPorPagina: 5,
            showIndex: true,
            tbodyId: "tabelaNoticias"
        });

    } catch (err) {
        console.error(err);
        mostrarMensagem(tab, "Erro ao carregar notícias");
    }
}

function bindEvents() {
    tab.addEventListener("click", handleClick);

    tab.querySelector("#confirmar-insert")?.addEventListener("click", salvarNoticia);
    tab.querySelector("#confirmar-delete")?.addEventListener("click", confirmarDelete);
    tab.querySelector("#confirmar-edit")?.addEventListener("click", confirmarEdicao);
}

function handleClick(e) {
    if(e.target.closest("#btn-insert")) return abrirModalInsert();

    const editar = e.target.closest(".btn-editar");
    if(editar) return editarNoticia(editar.dataset.id);

    const deletar = e.target.closest(".btn-deletar");
    if(deletar) return abrirModalDelete(deletar.dataset.id);
}

// INSERT
function abrirModalInsert() {
    const modal = tab.querySelector("#modalInsert");
    modal.querySelectorAll("input, textarea").forEach(el => el.value = "");
    new bootstrap.Modal(modal).show();
}

async function salvarNoticia(e) {
    const btn = e.currentTarget;
    toggleButtonLoading(btn, true);

    const modal = tab.querySelector("#modalInsert");

    try {
        const titulo = modal.querySelector("#tituloInput").value.trim();
        const subtitulo = modal.querySelector("#subtituloInput").value.trim();
        const descricao = modal.querySelector("#descricaoInput").value.trim();
        const data = modal.querySelector("#dataInput").value;
        const imagemFile = modal.querySelector("#imagemInput").files[0];

        if (!titulo || !descricao || !data) {
            toggleButtonLoading(btn, false);
            return mostrarMensagem(tab, "Preencha todos os campos obrigatórios");
        }

        const imagem_url = imagemFile 
            ? await uploadImagem(imagemFile,"imagens-noticias")
            : null;

        const { error } = await NoticiasService.create({
            titulo,
            subtitulo,
            descricao,
            data_noticia: data,
            noticia_imagem: imagem_url,
            slug: slug(titulo)
        });

        if (error) throw error;

        bootstrap.Modal.getInstance(modal).hide();

        mostrarMensagem(tab, "Notícia criada!");

        await registrarLog({
            acao: "insert",
            entidade: "noticia",
            descricao: `a notícia: ${titulo}`
        });
        
        await carregarNoticias();
        mostrarMensagem(tab, "Notícia Criada!");

    } catch (err) {
        console.error(err);
        mostrarMensagem(tab, "Erro ao salvar notícia");
    } finally {
        toggleButtonLoading(btn, false);
    }
}

// DELETE
function abrirModalDelete(id) {
    const btn = document.getElementById("confirmar-delete");
    btn.dataset.id = id;

    new bootstrap.Modal(document.getElementById("modalDelete")).show();
}

async function confirmarDelete(e) {
    const btn = e.currentTarget;
    toggleButtonLoading(btn, true);

    try {
        const id = btn.dataset.id;

        const { data, error } = await NoticiasService.getById(id);
        if (error) throw error;

        if (data?.noticia_imagem) {
            const path = decodeURIComponent(data.noticia_imagem
                .split("/imagens-noticias/")[1]
            );

            await deleteImagem("imagens-noticias", [path]);
        }

        await NoticiasService.delete(id);

        bootstrap.Modal.getInstance(document.getElementById("modalDelete")).hide();


        await registrarLog({
            acao: "delete",
            entidade: "noticia",
            descricao: `a noticia: ${data.titulo}`
        });

        await carregarNoticias();
        mostrarMensagem(tab, "Excluído!");

    } catch (err) {
        console.error(err);
        mostrarMensagem(tab, "Erro ao excluir");
    } finally {
        toggleButtonLoading(btn, false)
    }
}

// UPDATE
async function editarNoticia(id) {
    const { data } = await NoticiasService.getById(id);

    const modal = tab.querySelector("#modalEdit");

    modal.querySelector("#editTitulo").value = data.titulo || "";
    modal.querySelector("#editSubtitulo").value = data.subtitulo || "";
    modal.querySelector("#editDescricao").value = data.descricao || "";
    modal.querySelector("#editData").value = data.data_noticia || "";

    modal.querySelector("#confirmar-edit").dataset.id = id;

    new bootstrap.Modal(document.getElementById("modalEdit")).show();
}

async function confirmarEdicao(e) {
    const btn = e.currentTarget;
    toggleButtonLoading(btn, true);

    const modal = tab.querySelector("#modalEdit");

    try {
        const id = btn.dataset.id;

        const titulo = modal.querySelector("#editTitulo").value.trim();
        const descricao = modal.querySelector("#editDescricao").value.trim();
        const subtitulo = modal.querySelector("#editSubtitulo").value.trim();
        const data = modal.querySelector("#editData").value;

        if(!titulo || !descricao || !data) {
            toggleButtonLoading(btn, false);
            mostrarMensagem(tab, "reencha todos os campos");
        }

        await NoticiasService.update(id, {
                titulo,
                subtitulo,
                descricao,
                data_noticia: data,
                slug: slug(titulo)
            });

        bootstrap.Modal.getInstance(modal).hide();

        await registrarLog({
            acao: "update",
            entidade: "noticia",
            descricao: `a notícia: ${titulo}`
        });

        await carregarNoticias();
        mostrarMensagem(tab, "Atualizado");
    } catch (err) {
        console.error(err)
        mostrarMensagem(tab, "Erro ao atualizar")
    } finally {
        toggleButtonLoading(btn, false);
    }
}