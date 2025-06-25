// ATENÇÃO: COLE A URL DA SUA API DO SHEETDB AQUI DENTRO DAS ASPAS
const API_URL = 'https://sheetdb.io/api/v1/v7jb66f6jucny';

// Seleciona os elementos do HTML com os quais vamos trabalhar
const corpoTabela = document.getElementById('corpoTabela');
const filtroNome = document.getElementById('filtroNome');
const filtroModalidade = document.getElementById('filtroModalidade');
const filtroSexo = document.getElementById('filtroSexo');
const filtroCategoria = document.getElementById('filtroCategoria');
const loading = document.getElementById('loading');

// "Armazém" para guardar todos os resultados e não precisar buscar toda hora
let todosOsResultados = [];

// Função que busca os dados na planilha quando a página carrega
async function buscarResultados() {
    try {
        const response = await fetch(API_URL);
        todosOsResultados = await response.json();
        loading.style.display = 'none'; // Esconde a mensagem de "carregando"
        popularFiltros();
        exibirResultados(todosOsResultados);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        loading.innerText = 'Falha ao carregar os dados. Tente novamente mais tarde.';
    }
}

// Função que preenche os filtros de Modalidade e Categoria automaticamente
function popularFiltros() {
    const modalidades = new Set(); // 'Set' evita itens duplicados
    const categorias = new Set();

    todosOsResultados.forEach(atleta => {
        if (atleta.modalidade) modalidades.add(atleta.modalidade);
        if (atleta.categoria) categorias.add(atleta.categoria);
    });

    modalidades.forEach(modalidade => {
        const option = document.createElement('option');
        option.value = modalidade;
        option.textContent = modalidade;
        filtroModalidade.appendChild(option);
    });

    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        filtroCategoria.appendChild(option);
    });
}


// Função que exibe os resultados na tabela
function exibirResultados(resultados) {
    corpoTabela.innerHTML = ''; // Limpa a tabela antes de exibir os novos resultados

    resultados.forEach(atleta => {
        const tr = document.createElement('tr'); // Cria uma linha <tr>
        tr.innerHTML = `
            <td>${atleta.posicao_geral || '-'}</td>
            <td>${atleta.nome || '-'}</td>
            <td>${atleta.modalidade || '-'}</td>
            <td>${atleta.categoria || '-'}</td>
            <td>${atleta.tempo || '-'}</td>
            <td><button class="btn-pdf" onclick="gerarPDF(this)">PDF</button></td>
        `;
        // Adiciona os dados do atleta na própria linha para fácil acesso no PDF
        tr.dataset.atleta = JSON.stringify(atleta);
        corpoTabela.appendChild(tr); // Adiciona a linha na tabela
    });
}

// Função que é chamada toda vez que um filtro é alterado
function aplicarFiltros() {
    const nome = filtroNome.value.toLowerCase();
    const modalidade = filtroModalidade.value;
    const sexo = filtroSexo.value;
    const categoria = filtroCategoria.value;

    const resultadosFiltrados = todosOsResultados.filter(atleta => {
        const nomeAtleta = atleta.nome ? atleta.nome.toLowerCase() : '';

        return (nomeAtleta.includes(nome)) &&
               (modalidade === '' || atleta.modalidade === modalidade) &&
               (sexo === '' || atleta.sexo === sexo) &&
               (categoria === '' || atleta.categoria === categoria);
    });

    exibirResultados(resultadosFiltrados);
}

// Função para gerar o PDF
function gerarPDF(botao) {
    // Pega os dados do atleta que foram salvos na linha da tabela
    const linha = botao.closest('tr');
    const dadosAtleta = JSON.parse(linha.dataset.atleta);

    // Preenche o template do certificado com os dados
    document.getElementById('cert-nome').innerText = dadosAtleta.nome || 'Não informado';
    document.getElementById('cert-modalidade').innerText = dadosAtleta.modalidade || 'Não informada';
    document.getElementById('cert-categoria').innerText = dadosAtleta.categoria || 'Não informada';
    document.getElementById('cert-tempo').innerText = dadosAtleta.tempo || 'Não informado';
    document.getElementById('cert-posicao').innerText = dadosAtleta.posicao_geral || 'Não informada';

    // Pega o elemento do template
    const template = document.getElementById('template-certificado');
    template.style.display = 'block'; // Mostra o template para poder capturá-lo

    const { jsPDF } = window.jspdf;
    
    // Usa html2canvas para "fotografar" o template e jspdf para salvar em PDF
    html2canvas(document.querySelector(".certificado")).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        // O PDF será em modo paisagem (landscape)
        const pdf = new jsPDF('l', 'mm', 'a4'); 
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210); // A4 landscape size
        pdf.save(`certificado-${dadosAtleta.nome}.pdf`);

        template.style.display = 'none'; // Esconde o template novamente
    });
}


// "Escutadores" de eventos: rodam a função aplicarFiltros quando o usuário digita ou seleciona algo
filtroNome.addEventListener('input', aplicarFiltros);
filtroModalidade.addEventListener('change', aplicarFiltros);
filtroSexo.addEventListener('change', aplicarFiltros);
filtroCategoria.addEventListener('change', aplicarFiltros);

// Inicia tudo!
buscarResultados();