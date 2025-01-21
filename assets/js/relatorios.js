const container = document.getElementById('relatorios-lista');

async function listarRelatoriosPublicos() {
    const { data, error } = await supabaseClient.storage
        .from('files')
        .list('', { limit: 100 }); 

    data.forEach((arquivo) => {
        url = `https://jgbqolgtvagblvwrrydh.supabase.co/storage/v1/object/public/files/${encodeURIComponent(arquivo.name)}`
        
        const pdfElement = document.createElement('li');
        pdfElement.classList.add('col-12');

        pdfElement.innerHTML = `
            <a href="${url}" 
                target="_blank" 
                    download 
                    class="btn btn-outline-success btn-lg w-100 d-flex justify-content-center align-items-center">
                    <i class="bi bi-file-earmark-pdf-fill me-2"></i>
                    ${arquivo.name}
            </a>
        `;

        container.appendChild(pdfElement);
    
    });
}

listarRelatoriosPublicos()