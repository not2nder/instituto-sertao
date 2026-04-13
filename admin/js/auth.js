import { supabaseClient } from "./lib/supabase.js";
import { logLogout, logLogin } from "./services/logs.service.js";

export async function checkAuth() {
    try {
        const { data, error } = await supabaseClient.auth.getUser();

        if (error || !data.user) {
            window.location.href = "/login";
            return null;
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
        
        return user;

    } catch (err) {
        console.error("Erro na autenticação:", err);
        window.location.href = "/login";
        return null;
    }
}

export async function login(email, senha) {
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) throw error;

    await logLogin();

    return true;
}

export async function logout() {
    await logLogout();
    await supabaseClient.auth.signOut();
    window.location.href = "/login";
}

export async function getProfile() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "/login";
        return null;
    }

    const user = data.user;

    const { data: profile } = await supabaseClient
        .from("profiles")
        .select("nome, role")
        .eq("id", user.id)
        .single();
    
    return profile;
}