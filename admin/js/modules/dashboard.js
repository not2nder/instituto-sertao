import { getLogs } from "../services/logs.service.js";
import { NoticiasService } from "../services/noticias.service.js";
import { timeAgo } from "../util/timeAgo.js";

export async function initDashboard() {
    await carregarEstatisticas();
    await renderLogs();

    setTimeout(async () => {
        await renderChart();
    }, 50)
}

let myChartInstance = null;

export async function renderChart() {
    const {data: dataset, error} = await NoticiasService.getDates();

    if (error) return;

    const labels = Object.keys(dataset).sort((a, b) => {
        const [mesA, anoA] = a.split('-');
        const [mesB, anoB] = b.split('-');
        const dateA = new Date(`${mesA} 1, ${anoA}`);
        const dateB = new Date(`${mesB} 1, ${anoB}`);
        return dateA - dateB;
    });

    const dataArray = labels.map(l => dataset[l]);
    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChartInstance) myChartInstance.destroy();

    myChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Notícias nesse mês",
                data: dataArray,
                fill: true,
                borderColor: '#25be53',
                backgroundColor: '#00ff4016',
                borderWidth: 3,
                tension: 0.5,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    titleColor: '#fff',
                    displayColors: false,
                    intersect: false
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        drawTicks: false,
                        drawBorder: false,
                        display: false
                    },
                    ticks: {
                        autoSkip: true,
                        color:'#3a3a3a',
                        font: { size: 12 } 
                    }
                },
                y: {
                    drawOnChartArea: true,
                    beginAtZero: true,
                    grid: { drawTicks: false, drawBorder: false, color: '#8181817e' },
                    ticks: { color: '#2a2a2a', stepSize: 1, precision: 0 }
                }
            }
        }
    });
}

async function carregarEstatisticas() {
    const {data: noticia, error} = await NoticiasService.getLatest();

    if (error || !noticia) return;

    document.getElementById("ultima-noticia").innerHTML = `
        <img class="rounded" src="${noticia.noticia_imagem}">
        <div>
            <div>
                <h4 class="mb-2 mt-0">${noticia.titulo}</h4>
                <p class="noticia-texto">${noticia.descricao}</p>
            </div>
            <div class="d-flex justify-content-between flex-wrap align-items-center">
                <span class="text-muted"><i class="fa-regular fa-calendar-days"></i> ${new Date(noticia.data_noticia).toLocaleDateString()}</span>
                <a href="https://idssertao.org/noticia.html?slug=${noticia.slug}" class="btn btn-outline-success" target="_blank"><i class="fa-solid fa-link"></i> Ver Notícia</a>
            </div>
        </div>
    `;

    document.getElementById("total-noticias").innerText = await NoticiasService.countAll();
    document.getElementById("noticias-mes").innerText = await NoticiasService.countLast30Days();
    document.getElementById("data-ultima-noticia").innerText = new Date(noticia.data_noticia).toLocaleDateString();
}

export async function renderLogs() {
    const logs = await getLogs(5);
    const container = document.getElementById("logs");

    container.innerHTML = logs.map(log => {
        const data = new Date(log.created_at);

        const acoes = {
            insert: "adicionou",
            update: "editou",
            delete: "excluiu",
            login: "entrou",
            logout: "saiu"
        };

        return `
            <div class="log-item">
                <div class="log-dot log-${log.acao}"></div>
                <div>
                    <strong>${log.user_name}</strong> ${acoes[log.acao]} ${log.descricao}
                    <div class="log-date">${timeAgo(data)}</div>
                </div>
            </div>
        `;
    }).join("");
}
