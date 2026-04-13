import { supabaseClient } from "../api.js";

const container = document.getElementById("projetosContainer");

async function mostrarProjetos() {
    const { data } = await supabaseClient
        .from("projetos")
        .select("*")
        .order('created_at',{ ascending: false })
        .limit(3);

    container.innerHTML = "";

    data.forEach((p, index) => {
        const imagens = p.imagens?.length ? p.imagens : ["/assets/img/default.png"];

        const li = document.createElement("li");
        li.className = "col-sm-4";

        const a = document.createElement("a");
        a.className = "card h-100 text-decoration-none";
        li.appendChild(a);

        if (imagens.length > 1) {
            const carouselId = `carouselProjeto${index}`;

            const carousel = document.createElement("div");
            carousel.id = carouselId;
            carousel.className = "carousel slide";
            carousel.setAttribute("data-bs-ride", "carousel");

            const inner = document.createElement("div");
            inner.className = "carousel-inner";

            imagens.forEach((img, i) => {
                const item = document.createElement("div");
                item.className = `carousel-item ${i === 0 ? "active" : ""}`;

                item.innerHTML = `
                    <img src="${img}" class="d-block w-100"style="object-fit: cover; aspect-ratio: 16/9;">
                `;

                inner.appendChild(item);
            });

            carousel.innerHTML += `
                <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                </button>
            `;

            carousel.appendChild(inner);
            a.appendChild(carousel);

        } else {
            const image = document.createElement("img");
            image.className = "card-img-top";
            image.style = "object-fit: cover; width: 100%; aspect-ratio: 16/9";
            image.src = imagens[0];
            a.appendChild(image);
        }

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        a.appendChild(cardBody);

        const title = document.createElement("h5");
        title.className = "card-title";
        title.innerHTML = `<strong>${p.titulo}</strong>`;
        cardBody.appendChild(title);

        const descricao = document.createElement("p");
        descricao.className = "card-text";
        descricao.textContent = p.descricao;
        cardBody.appendChild(descricao);

        container.appendChild(li);
    });
}

mostrarProjetos();