const supabaseUrl = "https://jgbqolgtvagblvwrrydh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFvbGd0dmFnYmx2d3JyeWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTk5MzUsImV4cCI6MjA0NzMzNTkzNX0.7OyNFa2YTVUV2BEKc10FqyXyMA7JJ3yNCDvjVf0ZK0o"; // anon-key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function getNoticia() {
    loadSkeleton();

    const noticia_id = new URLSearchParams(window.location.search).get("id");
    const container = document.getElementById("noticia");

    if (!noticia_id) {
        mostrar404();
        return;
    }

    const { data, error } = await supabaseClient
        .from("noticias")
        .select("*")
        .eq("id", noticia_id)
        .single();

    if (error || !data) {
        mostrar404();
        return;
    }

    container.innerHTML = `
        <img class="rounded-3 w-100" source="${data.noticia_imagem}" id="imagem">
        <div class="my-3">
            <h3 id="subtitulo">${data.subtitulo}</h3>
        </div>
        <p id="descricao">${data.descricao}</p>
    `;

    document.getElementById("titulo").innerText = data.titulo;
    document.getElementById("imagem").src = data.noticia_imagem;
    document.getElementById("subtitulo").innerText = data.subtitulo;
    document.getElementById("descricao").innerText = data.descricao;

    document.title = data.titulo;
}

function mostrar404() {
    const container = document.querySelector(".container.px-4");

    container.innerHTML = ""
    container.innerHTML = `
        <div class="text-center my-5">
            <h2>Notícia não encontrada</h2>
            <p>Desculpe, a notícia que você está tentando acessar não existe ou foi removida.</p>
            <a href="index.html" class="mx-auto">Voltar para a página inicial <i class="bi bi-box-arrow-up-right"></i></a>
        </div>
    `;
}

getNoticia();

function loadSkeleton() {
    const noticia = document.getElementById("noticia");

    noticia.innerHTML = `
        <img class="rounded-3 w-100 skeleton sk-img" id="imagem">
        <div class="my-3">
            <h3 id="subtitulo" class="skeleton sk-text title"></h3>
        </div>
        <p id="descricao" class="skeleton sk-text"></p>
        <p id="descricao" class="skeleton sk-text"></p>
        <p id="descricao" class="skeleton sk-text"></p>
        <p id="descricao" class="skeleton sk-text"></p>
        <p id="descricao" class="skeleton sk-text"></p>
    `
}