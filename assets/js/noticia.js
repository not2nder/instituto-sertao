const supabaseUrl = "https://jgbqolgtvagblvwrrydh.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFvbGd0dmFnYmx2d3JyeWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTk5MzUsImV4cCI6MjA0NzMzNTkzNX0.7OyNFa2YTVUV2BEKc10FqyXyMA7JJ3yNCDvjVf0ZK0o" // anon-key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function getNoticia() {
    const noticia_id = new URLSearchParams(window.location.search).get("id")

    const { data, error } = await supabaseClient
        .from("noticias")
        .select("*")
        .eq("id", noticia_id)
        .single()

    if (error) {
        console.log("Erro ao carregar notícia", error);
        return;
    }

    document.getElementById("titulo").innerText = data.titulo;
    document.getElementById("imagem").src = data.noticia_imagem;
    document.getElementById("subtitulo").innerText = data.subtitulo;
    document.getElementById("descricao").innerText = data.descricao;

    document.title = data.titulo;
}

getNoticia();