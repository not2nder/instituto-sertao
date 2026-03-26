const supabaseUrl = "https://jgbqolgtvagblvwrrydh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYnFvbGd0dmFnYmx2d3JyeWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3NTk5MzUsImV4cCI6MjA0NzMzNTkzNX0.7OyNFa2YTVUV2BEKc10FqyXyMA7JJ3yNCDvjVf0ZK0o"; // anon-key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function login() {
  const btn = document.querySelector("button");
  btn.disabled = true;

  try {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
      throw new Error("Preencha todos os campos.")
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: senha
    });

    if (error) throw error;

    window.location.href = "/admin"

  } catch (err) {
    document.getElementById("erro").innerText = err.message;
  } finally {
    btn.disabled = false;
  }
}