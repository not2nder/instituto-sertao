import { supabaseClient } from "../lib/supabase.js";

export async function registrarLog({acao, entidade, descricao}) {
    const {data: {user}} = await supabaseClient.auth.getUser();

    if(!user) return;

    const {data: profile} = await supabaseClient
        .from("profiles")
        .select("nome, role")
        .eq("id",user.id)
        .single()

    await supabaseClient.from("logs")
        .insert([
            {
                user_id: user.id,
                user_email: user.email,
                user_name: profile.nome,
                role: profile.role,
                acao,
                entidade,
                descricao
            }
        ]);
}

export async function getLogs(limit) {
    const {data} = await supabaseClient
        .from("logs")
        .select("acao, created_at, descricao, entidade, user_name")
        .order("created_at", {ascending: false})
        .limit(limit);

    return data;
}

export async function getAllLogs() {
    const {data} = await supabaseClient
        .from("logs")
        .select("acao, created_at, descricao, entidade, user_name")
        .order("created_at", {ascending: false})

    return data;
}

export async function logLogin() {
    await registrarLog({
        acao: "login",
        entidade: "auth",
        descricao: "no sistema"
    });
}

export async function logLogout() {
    await registrarLog({
        acao: "logout",
        entidade: "auth",
        descricao: "do sistema"
    });
}