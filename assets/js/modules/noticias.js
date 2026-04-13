import { supabaseClient } from "../api.js";

const listaContainer = document.querySelector('#noticias-lista');

async function getEventos() {
        const { data, error } = await supabaseClient.from("noticias").select("*").limit(3).order('data_noticia', { ascending: false });
        if (error) { console.log("Erro ao Buscar os dados")}
        
        data.forEach(noticia => {
                const item = document.createElement('li')
                item.classList.add(`col-sm-${12/data.length}`)
                item.innerHTML = `
                <a class="card h-100" href="noticias/noticia.html?slug=${noticia.slug}">
                        <img class="card-img-top" style="object-fit: cover; width: 100%; aspect-ratio: 16/9" src="${noticia.noticia_imagem}">
                        <div class="card-body">
                                <h5 class="card-title"><strong>${noticia.titulo}</strong></h5>
                        </div>
                </a>
                `;
                listaContainer.appendChild(item);
        });
}

getEventos();