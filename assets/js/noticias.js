const supabaseUrl = "https://jgbqolgtvagblvwrrydh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFvbGd0dmFnYmx2d3JyeWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTk5MzUsImV4cCI6MjA0NzMzNTkzNX0.7OyNFa2YTVUV2BEKc10FqyXyMA7JJ3yNCDvjVf0ZK0o"; // anon-key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const listaContainer = document.querySelector('#noticias-lista');

async function getNoticias() {
        const { data, error } = await supabaseClient.from("noticias").select("*");
        if (error) { console.log("Erro ao Buscar os dados")}
        
        data.forEach(noticia => {
                const item = document.createElement('li')
                item.classList.add(`col-sm-12`,'border-bottom')
                item.innerHTML = `
                        <div class="card">
                                <div class="position-relative">
                                        <img class="card-img-top" style="object-fit: cover; width: 100%; aspect-ratio: 4/3" src="${noticia.noticia_imagem}" alt="Imagem da Notícia">
                                        <div class="card-img-overlay d-flex flex-column justify-content-end">
                                                <h3 class="card-title text-white" style=" font-family: Arial, Helvetica, sans-serif; font-weight: 350"><strong>${noticia.titulo}</strong></h3>
                                                <p class="card-text text-white"> <i class="bi bi-calendar-week"></i> ${noticia.data_noticia}</p>
                                        </div>
                                </div>
                        </div>
                        <h4 class="text-dark font-weight-bold my-3" style="font-family: Arial, Helvetica, sans-serif; font-weight: 700">${noticia.subtitulo}</h4>
                        <p class="text-secondary mt-3 px-1">${noticia.descricao}</p>
                `;
                listaContainer.appendChild(item);
        });
}

getNoticias();