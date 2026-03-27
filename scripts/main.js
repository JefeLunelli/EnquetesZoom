// Utilitários de conversão e variáveis globais
function mmToPt(mm) { return mm * 2.835; }
const alturaPaginaA4 = mmToPt(297); 
let participantesOriginal = [];

window.addEventListener('load', function() {
    const dateContainer = document.getElementById('dateContainer');
    if(dateContainer) {
        dateContainer.textContent = new Date().toLocaleDateString('pt-BR');
    }
});

// Eventos Iniciais
document.querySelectorAll('.botao-inicial').forEach(btn => {
    btn.addEventListener('click', function() {
        this.style.backgroundColor = '#ccc';
        setTimeout(() => { this.style.backgroundColor = ''; }, 1000);
    });
});

document.getElementById('customFileInput').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function() {
    if (this.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const lines = e.target.result.split(/\r?\n/);
            let participantes = [];
            let startIndex = lines.findIndex(line => line.startsWith('Informação Assistência'));
            
            if (startIndex !== -1) {
                startIndex += 2;
                for (let i = startIndex; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    let row = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
                    row = row.map(v => v.replace(/^"|"$/g, '').trim());
                    if (row.length >= 5) participantes.push(row);
                }
            }
            exibirParticipantes(participantes);
        };
        reader.readAsText(this.files[0]);
    }
});

function exibirParticipantes(participantes) {
    document.body.classList.add('tabela-exibida');
    document.getElementById('pdfButton').style.display = 'inline-block'; 
    participantesOriginal = participantes.map(p => [...p]);

    if (!document.getElementById('backToStartButton')) {
        const container = document.getElementById('controles-pos-tabela');
        const btnReverter = document.createElement('button');
        btnReverter.id = 'RevertButton';
        btnReverter.textContent = 'Reverter';
        btnReverter.className = 'button';
        btnReverter.onclick = () => exibirParticipantes(participantesOriginal);
        container.appendChild(btnReverter);

        const btnInicio = document.createElement('button');
        btnInicio.id = 'backToStartButton';
        btnInicio.textContent = 'Início';
        btnInicio.className = 'button';
        btnInicio.onclick = () => { window.scrollTo(0, 0); location.reload(); };
        container.appendChild(btnInicio);
    }

    const tabela = document.getElementById('tabela-participantes');
    tabela.innerHTML = '';
    const cabecalho = document.createElement('tr');
    cabecalho.innerHTML = `<th>Selecionar</th><th>Nomes pelo Zoom</th><th class="assistencia-col">Assistência</th>`;
    tabela.appendChild(cabecalho);

    let nomesAdicionados = {};
    participantes.forEach(p => {
        const nome = p[1];
        let assistencia = p[4];
        if (nome && assistencia && !nome.toLowerCase().includes('tribuna') && !nome.toLowerCase().includes('mesa de som')) {
            const linha = document.createElement('tr');
            const isRepetido = !assistencia.includes('pessoa') || nomesAdicionados[nome];
            if (isRepetido) {
                linha.innerHTML = `<td><input type="checkbox" class="participante-checkbox"></td><td class="nome-participante">${nome}</td><td class="assist-cell">Já informou</td>`;
                linha.classList.add('unchecked');
            } else {
                linha.innerHTML = `<td><input type="checkbox" class="participante-checkbox" checked></td><td class="nome-participante">${nome}</td><td class="assist-cell">${assistencia.replace('Já informei a assistência', 'Já Informou')}</td>`;
                nomesAdicionados[nome] = true;
            }
            linha.querySelector('.nome-participante').addEventListener('click', () => toggleLinha(linha));
            linha.querySelector('.assist-cell').addEventListener('click', function() { editarAssistencia(this); });
            linha.querySelector('.participante-checkbox').addEventListener('change', () => atualizarTotal());
            tabela.appendChild(linha);
        }
    });
    inserirLinhaTotal(tabela);
    atualizarTotal();
}

function toggleLinha(linha) {
    const cb = linha.querySelector('.participante-checkbox');
    cb.checked = !cb.checked;
    linha.classList.toggle('unchecked', !cb.checked);
    atualizarTotal();
}

function editarAssistencia(celula) {
    if (celula.querySelector('input')) return;
    const valorAtual = parseInt(celula.textContent) || 0;
    celula.innerHTML = `<input type="number" class="assistencia-cell-input" placeholder="${valorAtual}" min="0">`;
    const input = celula.querySelector('input');
    input.focus();
    input.onblur = () => {
        let novo = input.value.trim() || input.placeholder;
        if (novo === '0') {
            celula.textContent = 'Já Informou';
            celula.parentNode.querySelector('.participante-checkbox').checked = false;
            celula.parentNode.classList.add('unchecked');
        } else {
            celula.textContent = `${novo} pessoa${novo === '1' ? '' : 's'}`;
            celula.parentNode.querySelector('.participante-checkbox').checked = true;
            celula.parentNode.classList.remove('unchecked');
        }
        atualizarTotal();
    };
}

function inserirLinhaTotal(tabela) {
    const linha = document.createElement('tr');
    linha.innerHTML = `<td></td><td id="total-pessoas-label">Assistência total</td><td id="numero-total-pessoas">0</td>`;
    tabela.appendChild(linha);
}

function atualizarTotal() {
    let total = 0;
    document.querySelectorAll('.participante-checkbox:checked').forEach(cb => {
        total += parseInt(cb.parentNode.parentNode.cells[2].textContent) || 0;
    });
    document.getElementById('numero-total-pessoas').textContent = total;
}

// --- GERAÇÃO DE PDF FINAL ---

document.getElementById('pdfButton').addEventListener('click', function() {
    const selecionados = Array.from(document.querySelectorAll('.participante-checkbox:checked')).map(cb => {
        const row = cb.parentNode.parentNode;
        return { nome: row.cells[1].textContent, assistencia: row.cells[2].textContent };
    });

    if (selecionados.length === 0) return;

    // Aumentamos o espaço útil reduzindo as margens de cálculo
    const alturaUtil = alturaPaginaA4 - 60; 
    const hLinha = Math.min(50, (alturaUtil / (selecionados.length + 2))); 
    const fSize = Math.max(12, hLinha * 0.45); // Garante uma fonte legível e grande

    const docDef = {
        pageSize: 'A4',
        pageMargins: [30, 20, 30, 20], // Margens menores no topo/fundo
        content: [{
            table: {
                headerRows: 1,
                dontBreakRows: true, // Força a tabela a tentar ficar junta
                widths: ['70%', '30%'],
                body: [
                    [{text:'Nomes pelo Zoom', style:'tableHeader'}, {text:'Assistência', style:'tableHeader'}],
                    ...selecionados.map(p => [{text:p.nome, style:'tableCell'}, {text:p.assistencia, style:'tableCell'}]),
                    [{text:'Assistência Total', style:'tableHeader'}, {text:document.getElementById('numero-total-pessoas').textContent, style:'tableHeader'}]
                ]
            },
            layout: {
                fillColor: (i, node) => {
                    if (i === 0 || i === node.table.body.length - 1) return '#A9A9A9';
                    return (i % 2 !== 0) ? '#C9C9C9' : '#E9E9E9';
                },
                // Ajuste de padding para forçar o preenchimento sem quebrar página
                paddingTop: () => (hLinha * 0.22),
                paddingBottom: () => (hLinha * 0.22)
            }
        }],
        styles: {
            tableHeader: { fontSize: fSize + 2, bold: true, alignment: 'center' },
            tableCell: { fontSize: fSize, alignment: 'center' }
        }
    };

    const dataFormatada = new Date().toLocaleDateString('pt-BR').replace(/\//g,'_');

    pdfMake.createPdf(docDef).getBuffer(function (buffer) {
        const blob = new Blob([buffer], { type: 'application/pdf' });
        const file = new File([blob], `enquete_${dataFormatada}.pdf`, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: `Enquete ${dataFormatada}` });
        } else {
            pdfMake.createPdf(docDef).download(`enquete_${dataFormatada}.pdf`);
        }
    });
});
