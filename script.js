// URL do JSON de dados do GitHub Pages
const API_URL = 'https://dennisananias.github.io/resultado-natacao/dados.json';

const corpoTabela = document.getElementById('corpoTabela');
const filtroNome = document.getElementById('filtroNome');
const filtroModalidade = document.getElementById('filtroModalidade');
const filtroSexo = document.getElementById('filtroSexo');
const filtroCategoria = document.getElementById('filtroCategoria');
const loading = document.getElementById('loading');

let todosOsResultados = [];

// Buscar dados do JSON
async function buscarResultados() {
    try {
        const response = await fetch(API_URL);
        todosOsResultados = await response.json();
        loading.style.display = 'none';
        popularFiltros();
        exibirResultados(todosOsResultados);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        loading.innerText = 'Falha ao carregar os dados.';
    }
}

// Popular filtros de modalidade e categoria
function popularFiltros() {
    const modalidades = new Set();
    const categorias = new Set();

    todosOsResultados.forEach(atleta => {
        if (atleta.modalidade) modalidades.add(atleta.modalidade);
        if (atleta.categoria) categorias.add(atleta.categoria);
    });

    modalidades.forEach(mod => {
        const opt = document.createElement('option');
        opt.value = mod;
        opt.textContent = mod;
        filtroModalidade.appendChild(opt);
    });

    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filtroCategoria.appendChild(opt);
    });
}

// Exibir resultados na tabela
function exibirResultados(resultados) {
    corpoTabela.innerHTML = '';

    resultados.forEach(atleta => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${atleta.posicao_geral || '-'}</td>
            <td>${atleta.posicao_categoria || '-'}</td>
            <td>${atleta.nome || '-'}</td>
            <td>${atleta.modalidade || '-'}</td>
            <td>${atleta.categoria || '-'}</td>
            <td>${atleta.tempo || '-'}</td>
            <td><button class="btn-pdf" onclick="gerarPDF(this)">PDF</button></td>
        `;
        tr.dataset.atleta = JSON.stringify(atleta);
        corpoTabela.appendChild(tr);
    });
}

// Aplicar filtros nos resultados
function aplicarFiltros() {
    const nome = filtroNome.value.toLowerCase();
    const modalidade = filtroModalidade.value;
    const sexo = filtroSexo.value;
    const categoria = filtroCategoria.value;

    const filtrados = todosOsResultados.filter(atleta => {
        const nomeAtleta = atleta.nome ? atleta.nome.toLowerCase() : '';
        return nomeAtleta.includes(nome) &&
               (modalidade === '' || atleta.modalidade === modalidade) &&
               (sexo === '' || atleta.sexo === sexo) &&
               (categoria === '' || atleta.categoria === categoria);
    });

    exibirResultados(filtrados);
}

// Gerar o certificado em PDF com dados dinâmicos
function gerarPDF(botao) {
    const linha = botao.closest('tr');
    const dados = JSON.parse(linha.dataset.atleta);

    document.getElementById('cert-nome').innerText = dados.nome || 'Não informado';
    document.getElementById('cert-modalidade').innerText = dados.modalidade || 'Não informada';
    document.getElementById('cert-categoria').innerText = dados.categoria || 'Não informada';
    document.getElementById('cert-posicao').innerText = dados.posicao_geral || '-';

    const linhaCategoria = document.getElementById('linha-categoria');
    if (dados.posicao_categoria && dados.posicao_categoria !== '0') {
        document.getElementById('cert-posicao-categoria').innerText = dados.posicao_categoria;
        linhaCategoria.style.display = 'inline';
    } else {
        linhaCategoria.style.display = 'none';
    }

    // Aqui você define a data do evento manualmente
    document.getElementById('cert-data').innerText = '26 de junho de 2025';

    const template = document.getElementById('template-certificado');
    template.style.display = 'block';

    const { jsPDF } = window.jspdf;

    html2canvas(document.getElementById('certificado-gerado'), {
        scale: 4, // alta qualidade do PDF
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`certificado-${dados.nome}.pdf`);
        template.style.display = 'none';
    });
}

// Eventos dos filtros
filtroNome.addEventListener('input', aplicarFiltros);
filtroModalidade.addEventListener('change', aplicarFiltros);
filtroSexo.addEventListener('change', aplicarFiltros);
filtroCategoria.addEventListener('change', aplicarFiltros);

// Inicializar busca
buscarResultados();
