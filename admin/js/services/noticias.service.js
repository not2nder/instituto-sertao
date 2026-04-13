import { supabaseClient } from "../lib/supabase.js";

const TABLE = "noticias";

export const NoticiasService = {
    getAll() {
        return supabaseClient
            .from(TABLE)
            .select("*")
            .order("data_noticia", { ascending: false });
    },

    async getDates() {
        const {data, error} = await supabaseClient
            .from(TABLE)
            .select("data_noticia");

        if (error) return {data: null, error};

        const dataset = {};

        data.forEach(noticia => {
            const date = new Date(noticia.data_noticia);
            const month = date.toLocaleString('pt-BR', { month: 'short' }).toLowerCase();
            const year = date.getFullYear();
            const key = `${month} ${year}`;

            dataset[key] = (dataset[key] || 0)+1;
        });

        return {data: dataset, error: null};
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

    getLatest() {
        return supabaseClient
            .from(TABLE)
            .select("*")
            .order("data_noticia", { ascending: false })
            .limit(1)
            .single();
    },

    async countAll() {
        const { count } = await supabaseClient
            .from(TABLE)
            .select("*", { count: "exact" });

        return count;
    },

    async countLast30Days() {
        const date = new Date();
        date.setDate(date.getDate() - 30);

        const { count } = await supabaseClient
            .from(TABLE)
            .select("*", { count: "exact" })
            .gte("data_noticia", date.toISOString());

        return count;
    }
};