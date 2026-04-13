import { login } from "../admin/js/auth.js";

const btn = document.querySelector(".btn-login");

btn.addEventListener("click", handleLogin);

async function handleLogin() {
    btn.disabled = true;

    try {
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (!email || !senha) {
            throw new Error("Preencha todos os campos.");
        }

        await login(email, senha);

        window.location.href = "/admin";

    } catch (err) {
        document.getElementById("erro").innerText = err.message;
    } finally {
        btn.disabled = false;
    }
}

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener('click', () => {
    const input = document.getElementById("senha");
    const eyeIcon = document.getElementById("eyeIcon");

    input.type = input.type === "password" ? "text" : "password";
    eyeIcon.classList.value =
        eyeIcon.classList.value === "bi-eye"
        ? "bi-eye-slash"
        : "bi-eye";
});