import { supabaseClient } from "../lib/supabase.js";

export async function uploadImagem(file, bucket){
    try {
        const extensao = file.name.split(".").pop();
        const nome = `${crypto.randomUUID()}.${extensao}`;

        const { error } = await supabaseClient.storage
            .from(bucket)
            .upload(nome, file);
        
        if (error) throw error;

        const { data } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(nome);

        return data.publicUrl;
    } catch (error) {
        console.error(error);
        throw new Error("Falha ao fazer upload da imagem");
    }
}

export async function deleteImagem(bucket, path) {
    try {
        if (!path) return;

        const {error} = await supabaseClient.storage
            .from(bucket)
            .remove(path);
        
        if (error) throw error;

        return true;
    } catch (error) {
        console.error(error);
        throw new Error("Falha ao remover imagem");
    }
}