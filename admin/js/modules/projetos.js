import { ProjetosService } from "../services/projetos.service.js";
import { criarTabela } from "../util/tables.js";
import { mostrarMensagem, toggleButtonLoading } from "../util/ui.js";
import { registrarLog } from "../services/logs.service.js";
import { deleteImagem, uploadImagem } from "../services/upload.service.js";

const tab = document.getElementById("projetos");

export async function initProjetos() {
    await carregarProjetos();
    bindEvents();
}

async function carregarProjetos() {
    const card = tab.querySelector("#cardProjetos");
    
    try {
        const {data, error} = await ProjetosService.getAll();
        if (error) throw error;
        
        criarTabela(card, {
            header: {
                label: "Painel de Projetos",
                insertButton: true,
                button_text: "Inserir Projeto"
            },
            columns: [
                {title: "Imagem", field: "imagens", type: "image"},
                {title: "Título", field: "titulo", class: "fw-semibold text-truncate"},
                {title: "Descrição", field: "descricao", class: "text-muted text-truncate"},
                {title: "Data", field: "created_at", type: "date"}
            ],
            actions: [
                {icon: "bi-pencil", class: "btn-primary", btnClass: "btn-editar"},
                {icon: "bi-trash", class: "btn-danger", btnClass: "btn-deletar"},
                {icon: "bi-image", class: "btn-warning text-light", btnClass: "btn-img"}
            ],
            dataset: data,
            itensPorPagina: 8,
            showIndex: true,
            tbodyId: "tabelaProjetos"
        })
    } catch (err) {
        console.error(err)
        mostrarMensagem(tab, "Erro ao carregar projetos");
    }
}

function bindEvents() {
    tab.addEventListener("click", handleClick);

    tab.querySelector("#confirmar-insert")?.addEventListener("click", salvarProjeto);
    tab.querySelector("#confirmar-delete")?.addEventListener("click", confirmarDelete);
    tab.querySelector("#confirmar-edit")?.addEventListener("click", confirmarEdicao);
    tab.querySelector("#confirmar-imagens")?.addEventListener("click", salvarImagens);
}

function handleClick(e) {
    const insert = e.target.closest("#btn-insert");
    if (insert) return abrirModalInsert();

    const editar = e.target.closest(".btn-editar");
    if(editar) return editarProjeto(editar.dataset.id);

    const deletar = e.target.closest(".btn-deletar");
    if(deletar) return abrirModalDelete(deletar.dataset.id);

    const imagem = e.target.closest(".btn-img");
    if(imagem) return abrirModalImagem(imagem.dataset.id);
}

// INSERT
function abrirModalInsert() {
    const modal = tab.querySelector("#modalInsertProjeto");
    modal.querySelectorAll("input, textarea").forEach(el => el.value = "");
    new bootstrap.Modal(modal).show();
}

async function salvarProjeto(e) {
    const btn = e.currentTarget;
    toggleButtonLoading(btn, true);

    const modal = tab.querySelector("#modalInsertProjeto");

    try {
        const titulo = modal.querySelector("#tituloInput").value.trim();
        const descricao = modal.querySelector("#descricaoInput").value.trim();

        if (!titulo || !descricao) return mostrarMensagem(tab, "Preencha todos os campos");

        const { error } = await ProjetosService.create({titulo, descricao});
        if (error) throw error;

        bootstrap.Modal.getInstance(modal).hide();

        await registrarLog({
            acao: "insert",
            entidade: "projeto",
            descricao: `o projeto: ${titulo}`
        });

        await carregarProjetos();
        mostrarMensagem(tab, "Sucesso");

    } catch (err) {
        console.error(err);
        mostrarMensagem(tab, "Erro ao salvar projeto")
    } finally {
        toggleButtonLoading(btn, false);
    }
}

// DELETE
function abrirModalDelete(id) {
    const btn = tab.querySelector("#confirmar-delete");
    btn.dataset.id = id;

    new bootstrap.Modal(tab.querySelector("#modalDelete")).show();
}

async function confirmarDelete(e) {
    const btn = e.currentTarget;
    toggleButtonLoading(btn, true);
    
    try {
        const id = btn.dataset.id;

        const { data, error } = await ProjetosService.getById(id);
        if (error) throw error;

        const imagens = data.imagens || [];

        if(imagens.length > 0) {
            const paths = imagens.map(img => decodeURIComponent(img.split("/imagens-projetos/")[1]));

            const { error } = await deleteImagem("imagens-projetos", paths);
            if (error) throw error;
        }

        await ProjetosService.delete(id);

        await registrarLog({
            acao: "delete",
            entidade: "projeto",
            descricao: `o projeto: ${data.titulo}`
        });

        bootstrap.Modal.getInstance(tab.querySelector("#modalDelete")).hide();

        await carregarProjetos();
        mostrarMensagem(tab, "Excluído");

    } catch (err) {
        console.error(err);
        mostrarMensagem(tab, "Erro ao excluir");
    } finally {
        toggleButtonLoading(btn, false);
    }
}

// UPDATE
async function editarProjeto(id) {
    const { data } = await ProjetosService.getById(id);
    
    const modal = tab.querySelector("#modalEdit");

    modal.querySelector("#editTitulo").value = data.titulo || "";
    modal.querySelector("#editDescricao").value = data.descricao || "";

    modal.querySelector("#confirmar-edit").dataset.id = id;

    new bootstrap.Modal(tab.querySelector("#modalEdit")).show();
}

async function confirmarEdicao(e) {
    const btn = e.currentTarget;
    toggleButtonLoading(btn, true);

    const modal = tab.querySelector("#modalEdit");

    try {
        const id = btn.dataset.id;

        const titulo = modal.querySelector("#editTitulo").value.trim();
        const descricao = modal.querySelector("#editDescricao").value.trim();

        if(!titulo || !descricao) {
            return mostrarMensagem(tab, "Preencha todos os campos");
        }

        await ProjetosService.update(id, { titulo, descricao });

        bootstrap.Modal.getInstance(modal).hide();

        await registrarLog({
            acao: "update",
            entidade: "projeto",
            descricao: `o projeto: ${titulo}`
        });

        await carregarProjetos();
        mostrarMensagem(tab,"Atualizado");

    } catch (err) {
        mostrarMensagem(tab, "Erro ao atualizar")
        console.error(err)
    } finally {
        toggleButtonLoading(btn, false);
    }
}

// IMAGEM
async function abrirModalImagem(id) {
    const modal = document.getElementById("modalImagem");
    const btn = tab.querySelector("#confirmar-imagens");
    btn.dataset.id = id;

    const { data } = await ProjetosService.getById(id);

    const inputs = modal.querySelectorAll(".input-imagem");

    inputs.forEach((input, index) => {
        const view = input.closest(".drop-area").querySelector(".img-view");
        const img = view.querySelector("img");

        const url = data.imagens?.[index];

        if(url) {
            img.src = url;
            view.classList.add("active");
        } else {
            img.src = "";
            view.classList.remove("active");
        }

        input.value = ""

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            img.src = URL.createObjectURL(file);
            view.classList.add("active")
        }
    })

    new bootstrap.Modal(modal).show();
}

async function salvarImagens(e) {
    const btn = e.currentTarget;
    const id =btn.dataset.id

    toggleButtonLoading(btn, true);

    try {
        const { data } = await ProjetosService.getById(id);

        let imagens = data.imagens || []
        const inputs = tab.querySelectorAll("#modalImagem .input-imagem");

        const novasImagens = await Promise.all(
            [...inputs].map(async (input, index) => {
                const file = input.files[0];
                if(!file) return data.imagens?.[index] || null;

                return await uploadImagem(file, "imagens-projetos")
            })
        );

        imagens = novasImagens.filter(Boolean);

        if (!imagens.length) {
            return mostrarMensagem(tab, "Adicione pelo menos 1 imagem");
        }

        await ProjetosService.update(id, { imagens });

        await registrarLog({
            acao: "update",
            entidade: "projeto",
            descricao: `a imagem do projeto: ${data.titulo}`
        });

        bootstrap.Modal.getInstance(tab.querySelector("#modalImagem")).hide();

        await carregarProjetos();
        mostrarMensagem(tab, "Imagens enviadas");

    } catch (err) {
        console.error(err);
        mostrarMensagem(tab, "Erro ao enviar imagens");
    } finally {
        toggleButtonLoading(btn, false);
    }
}