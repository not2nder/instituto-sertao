const supabaseUrl = "https://jgbqolgtvagblvwrrydh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFvbGd0dmFnYmx2d3JyeWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTk5MzUsImV4cCI6MjA0NzMzNTkzNX0.7OyNFa2YTVUV2BEKc10FqyXyMA7JJ3yNCDvjVf0ZK0o"; // anon-key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
let inactivity = 10*60*1000;
let timeout;

async function checkAuth() {
  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
      window.location.href = "/login";
      return;
    }

    const user = data.user;

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      alert("Acesso negado");
      window.location.href = "/";
      return;
    }

    carregarNoticias();

  } catch (err) {
    console.error("Erro na autenticação:", err);
    window.location.href = "/login";
  }
}

checkAuth();

async function carregarNoticias() {
  const { data, error } = await supabaseClient
    .from("noticias")
    .select("*")
    .order("data_noticia", {ascending: false})

  if (error) {
    mostrarMensagem("Erro ao Carregar Notícias")
    return;
  }

  const tabela = document.getElementById("tabelaNoticias");

  tabela.innerHTML = data.map(noticia => `
      <tr>
        <td class="fw-semibold text-truncate painel-titulo" style="max-width: 120px;">${noticia.titulo}</td>
        <td class="text-muted text-truncate painel-subtitulo" style="max-width: 200px;">${noticia.subtitulo}</td>
        <td class="text-muted text-truncate painel-descricao" style="max-width: 320px;">${noticia.descricao}</td>

        <td class="text-truncate painel-img" style="max-width: 100px;"><a href=${noticia.noticia_imagem} target="_blank">${noticia.noticia_imagem}</a></td>

        <td class="painel-data">
          <span class="badge bg-light text-dark border">
            ${new Date(noticia.data_noticia).toLocaleDateString()}
          </span>
        </td>

        <td class="painel-acoes">
          <div class="text-center gap-2">
            <button class="btn btn-sm btn-action"
              onclick="editarNoticia('${noticia.id}')">
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button class="btn btn-sm btn-action"
              onclick="abrirModalDelete('${noticia.id}')">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </td>
      </tr>
      </tr>
    `).join("");
}

function abrirModalInsert() {
  new bootstrap.Modal(document.getElementById("modalInsert")).show();
}

async function salvarNoticia() {
  const titulo = document.getElementById("tituloInput").value;
  const subtitulo = document.getElementById("subtituloInput").value;
  const descricao = document.getElementById("descricaoInput").value;
  const data = document.getElementById("dataInput").value;
  const imagemFile = document.getElementById("imagemInput").files[0];

  if (!titulo || !descricao || !data) {
    mostrarMensagem("Preencha Todos os Campos!")
    return;
  }

  let imagem_url = null;

  if (imagemFile) {
    imagem_url = await uploadImagem(imagemFile);
  }

  const { error } = await supabaseClient
    .from("noticias")
    .insert([
      {
        titulo: titulo,
        subtitulo: subtitulo,
        data_noticia: data,
        descricao: descricao,
        noticia_imagem: imagem_url
      }
    ]);

    if (error) {
      mostrarMensagem("Erro ao Salvar Notícia");
      return;
    }

  bootstrap.Modal.getInstance(document.getElementById("modalInsert")).hide();
  mostrarMensagem("Notícia Adicionada com Sucesso!")
  carregarNoticias();
}

async function uploadImagem(file) {

  const nome = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;

  const { error } = await supabaseClient.storage
    .from("imagens-noticias")
    .upload(nome, file);

    if (error) {
      mostrarMensagem("Erro no upload")
      return null;
    }
    
    const {data} = supabaseClient.storage
      .from("imagens-noticias")
      .getPublicUrl(nome)

    return data.publicUrl;
}

function abrirModalDelete(id){
  document.getElementById('btnDeletar').onclick = () => deletarNoticia(id)
  new bootstrap.Modal(document.getElementById('modalDelete')).show()
}

async function deletarNoticia(id) {
  if (!id) return;

  try {
    const {data, error} = await supabaseClient
      .from('noticias')
      .select("noticia_imagem")
      .eq('id',id)
      .single();
    
    if (error) throw error;

    if (data?.noticia_imagem) {
      const caminho = decodeURIComponent(data.noticia_imagem.split('/imagens-noticias/')[1]);

      await supabaseClient.storage
        .from('imagens-noticias')
        .remove([caminho]);
    }

    const {error: deleteError} = await supabaseClient
      .from("noticias")
      .delete()
      .eq("id",id);

    if (deleteError) throw deleteError;

    bootstrap.Modal.getInstance(document.getElementById("modalDelete")).hide();
    mostrarMensagem("Notícia Excluída com Sucesso!")
    carregarNoticias();

  } catch (err) {
    mostrarMensagem("Erro ao Excluir Notícia")
  }
}

async function editarNoticia(id) {
  if (!id) return;

  const { data, error } = await supabaseClient
    .from("noticias")
    .select("*")
    .eq("id",id)
    .single();

  if (error) {
    console.error(error);
    mostrarMensagem("Erro ao carregar notícia");
    return;
  }

  document.getElementById("editTitulo").value = data.titulo || "";
  document.getElementById("editSubtitulo").value = data.subtitulo || "";
  document.getElementById("editDescricao").value = data.descricao || "";
  document.getElementById("editData").value = data.data_noticia || "";

  document.getElementById("btnSalvarEdicao").onclick = () => {
    salvarEdicao(id);
  };

  new bootstrap.Modal(document.getElementById("modalEdit")).show();
}

async function salvarEdicao(id) {
  if (!id) return;

  const titulo = document.getElementById("editTitulo").value.trim();
  const subtitulo = document.getElementById("editSubtitulo").value.trim();
  const descricao = document.getElementById("editDescricao").value.trim();
  const data = document.getElementById("editData").value;

  if (!titulo || !descricao || !data) {
    mostrarMensagem("Preencha os campos obrigatórios");
    return;
  }

  const { error } = await supabaseClient
    .from("noticias")
    .update({
      titulo,
      subtitulo,
      descricao,
      data_noticia: data
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    mostrarMensagem("Erro ao atualizar notícia");
    return;
  }

  document.activeElement.blur();

  bootstrap.Modal.getInstance(
    document.getElementById("modalEdit")
  ).hide();

  mostrarMensagem("Notícia atualizada com sucesso!");
  carregarNoticias();
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "/login";
}

function mostrarMensagem(msg) {
  const toast = document.getElementById("liveToast")
  const mensagem = document.getElementById("mensagem")

  mensagem.innerText = msg
  new bootstrap.Toast(toast).show();
}

function resetTimer() {
  clearTimeout(timeout);
  timeout = setTimeout(logout, inactivity)
}

["click","mousemove","keydown","scroll","touchstart"].forEach(event => {
  document.addEventListener(event, resetTimer)
});

window.addEventListener("load", resetTimer)

// window.addEventListener("beforeunload", async () => {
//     await supabaseClient.auth.signOut();
// });