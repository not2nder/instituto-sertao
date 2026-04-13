import { supabaseClient } from "../lib/supabase.js";

const TABLE = "projetos";

export const ProjetosService = {
    getAll() {
        return supabaseClient
            .from(TABLE)
            .select("*")
            .order("created_at", { ascending: false });
    },

    getById(id) {
        return supabaseClient
            .from(TABLE)
            .select("*")
            .eq("id", id)
            .single();
    },

    create(payload) {
        return supabaseClient
            .from(TABLE)
            .insert([payload]);
    },

    update(id, payload) {
        return supabaseClient
            .from(TABLE)
            .update(payload)
            .eq("id", id);
    },

    delete(id) {
        return supabaseClient
            .from(TABLE)
            .delete()
            .eq("id", id);
    },

    updateImages(id, payload) {
        return supabaseClient
            .from(TABLE)
            .update(payload)
            .eq("id", id);
    }
};