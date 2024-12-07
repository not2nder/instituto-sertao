const supabaseUrl = "https://jgbqolgtvagblvwrrydh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFvbGd0dmFnYmx2d3JyeWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTk5MzUsImV4cCI6MjA0NzMzNTkzNX0.7OyNFa2YTVUV2BEKc10FqyXyMA7JJ3yNCDvjVf0ZK0o"; // anon-key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const listaContainer = document.querySelector('#eventos-lista');

async function getEventos() {
        const { data, error } = await supabaseClient.from("eventos").select("*").limit(3).order('data_evento', { ascending: false });
        if (error) { console.log("Erro ao Buscar os dados")}
        console.log(data)
        data.forEach(evento => {
                const item = document.createElement('li')
                item.classList.add(`col-sm-${12/data.length}`)
                item.innerHTML = `
                <div class="card h-100">
                        <img class="card-img-top" style="object-fit: cover; width: 100%; aspect-ratio: 16/9" src="${evento.imagem_url}">
                        <div class="card-body">
                                <h5 class="card-title"><strong>${evento.titulo}</strong></h5>
                                <p class="card-text text-secondary">${evento.descricao}</p>
                        </div>
                </div>
                `;
                listaContainer.appendChild(item);
        });
}

getEventos();