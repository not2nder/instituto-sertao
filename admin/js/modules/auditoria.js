import { criarTimeline } from "../util/timeline.js";
import { getAllLogs } from "../services/logs.service.js";

export async function initAuditoria() {
    const card = document.getElementById("cardTimeline");
    const logs = await getAllLogs();
    criarTimeline(card, {
        label: "Atividade Recente",
        dataset: logs,
        itensPorPagina: 8
    });
}