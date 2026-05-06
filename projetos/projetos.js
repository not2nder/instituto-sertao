import { supabaseClient } from "../assets/js/api.js";

const listaContainer = document.querySelector("#projetos-lista");

async function getProjetos() {
  loadSkeleton();

  const { data, error } = await supabaseClient
    .from("projetos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erro ao Buscar os dados");
    return;
  }

  listaContainer.innerHTML = "";

  data.forEach((p, index) => {
    const imagens = p.imagens?.length ? p.imagens : ["/assets/img/default.png"];

    const li = document.createElement("li");
    li.className = "col-12 col-sm-6 col-lg-4";
    li.id = p.id;

    const card = document.createElement("div");
    card.className = "card h-100 border-0 shadow-sm";

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

        const image = document.createElement("img");
        image.src = img;
        image.className = "d-block w-100";
        image.style = "object-fit: cover; aspect-ratio: 4/3;";

        item.appendChild(image);
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
      card.appendChild(carousel);
    } else {
      const image = document.createElement("img");
      image.className = "card-img-top";
      image.style = "object-fit: cover; width: 100%; aspect-ratio: 16/9";
      image.src = imagens[0];

      card.appendChild(image);
    }

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.innerHTML = `<strong>${p.titulo}</strong>`;

    const descricao = document.createElement("p");
    descricao.className = "card-text";
    descricao.textContent = p.descricao;

    cardBody.appendChild(title);
    cardBody.appendChild(descricao);

    card.appendChild(cardBody);
    li.appendChild(card);

    listaContainer.appendChild(li);
  });
}

function loadSkeleton() {
  listaContainer.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const item = document.createElement("li");
    item.classList.add("col-sm-4", "col-md-6", "col-lg-4");

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

getProjetos();
