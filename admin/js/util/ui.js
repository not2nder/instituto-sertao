export function mostrarMensagem(tab, text) {
    const toast = tab.querySelector("#liveToast");
    const mensagem = tab.querySelector("#mensagem");

    mensagem.innerText = text;
    new bootstrap.Toast(toast).show()
}

export function toggleButtonLoading(button, isLoading, text = "Carregando...") {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = text;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
    }
}