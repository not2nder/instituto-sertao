import { supabaseClient } from "../assets/js/api.js";

const listaContainer = document.querySelector('#noticias-lista');

async function getNoticias() {
        loadSkeleton()

        const {data, error} = await supabaseClient
                .from("noticias")
                .select("*")
                .order('data_noticia', { ascending: false });
        
        if (error) { console.log("Erro ao Buscar os dados")}

        listaContainer.innerHTML = "";
        data.forEach(noticia => {
                const item = document.createElement('li')
                item.classList.add(`col-sm-4`,'border-bottom','col-md-6','col-lg-4')
                item.innerHTML = `
                        <a href="noticia.html?slug=${noticia.slug}">
                                <div class="card">
                                        <div class="position-relative">
                                                <img class="card-img-top" style="object-fit: cover; aspect-ratio: 4/3" src="${noticia.noticia_imagem}" alt="Imagem da Notícia">
                                                <div class="card-img-overlay d-flex flex-column justify-content-end">
                                                        <h4 class="card-title text-white" style=" font-family: Arial, Helvetica, sans-serif; font-weight: 350"><strong>${noticia.titulo}</strong></h4>
                                                        <p class="card-text text-white"> <i class="bi bi-calendar-week"></i> ${noticia.data_noticia}</p>
                                                </div>
                                        </div>
                                </div>
                                <div class="px-2 col">
                                        <h4 class="text-dark font-weight-bold my-3" style="font-family: Arial, Helvetica, sans-serif; font-weight: 700">${noticia.subtitulo}</h4>
                                </div>
                        </a>
                `;
                listaContainer.appendChild(item);
        });
}

function loadSkeleton() {
        listaContainer.innerHTML = "";

        for (let i = 0; i < 6; i++) {
                const item = document.createElement('li');
                item.classList.add('col-sm-4','col-md-6','col-lg-4');

                item.innerHTML = `
                <div class="card border-0">
                        <div class="position-relative">
                        <div class="skeleton sk-card-img"></div>

                        <div class="sk-overlay">
                                <div class="skeleton sk-text sk-title"></div>
                                <div class="skeleton sk-text sk-date"></div>
                        </div>
                        </div>
                </div>

                <div class="px-2">
                        <div class="skeleton sk-text sk-subtitle"></div>
                </div>
                `;

                listaContainer.appendChild(item);
        }
}

getNoticias();