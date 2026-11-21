import { supabaseClient } from "../lib/supabase.js";

const TABLE = "relatorios";
const BUCKET = "files";

export const RelatoriosService = {
  // DATABASE

  getAll() {
    return supabaseClient
      .from(TABLE)
      .select("*")
      .order("data_relatorio", { ascending: false });
  },

  getById(id) {
    return supabaseClient.from(TABLE).select("*").eq("id", id).single();
  },

  create(payload) {
    return supabaseClient.from(TABLE).insert([payload]).select().single();
  },

  delete(id) {
    return supabaseClient.from(TABLE).delete().eq("id", id);
  },

  // STORAGE

  upload(file, path) {
    return supabaseClient.storage.from(BUCKET).upload(path, file, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });
  },

  deleteFile(path) {
    return supabaseClient.storage.from(BUCKET).remove([path]);
  },

  getSignedUrl(path) {
    return supabaseClient.storage.from(BUCKET).createSignedUrl(path, 3600);
  },
};
