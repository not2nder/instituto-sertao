const supabaseUrl = "https://jgbqolgtvagblvwrrydh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFvbGd0dmFnYmx2d3JyeWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTk5MzUsImV4cCI6MjA0NzMzNTkzNX0.7OyNFa2YTVUV2BEKc10FqyXyMA7JJ3yNCDvjVf0ZK0o"; // anon-key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const listaContainer = document.querySelector('#eventos-lista');

async function getProdutos() {
        const { data, error } = await supabaseClient.from("noticias").select("*").limit(3);
        if (error) { console.log("Erro ao Buscar os dados")}
        
        data.forEach(noticia => {
                const item = document.createElement('li')
                item.classList.add(`col-sm-${12/data.length}`)
                item.style = "list-style: none"
                item.innerHTML = `
                <div class="card h-100">
                        <img class="card-img-top" style="object-fit: cover; width: 100%; aspect-ratio: 4/3" src="${noticia.imagem_url}">
                        <div class="card-body">
                                <h5 class="card-title"><strong>${noticia.titulo}</strong></h5>
                                <p class="card-text text-secondary">${noticia.descricao}</p>
                        </div>
                </div>
                `;
                listaContainer.appendChild(item);
        });
}

getProdutos();