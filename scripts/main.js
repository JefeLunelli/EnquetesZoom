function mmToPt(mm) {
  return mm * 2.835; // 1 mm = 2.835 pt
}

window.addEventListener('load', function() {
  // Rolar para o topo ao recarregar a página
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  }

  // Desativar a restauração da posição de rolagem ao recarregar a página
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Adicione um evento de alteração ao elemento fileInput
  document.getElementById('fileInput').addEventListener('input', function() {
    if (this.files.length > 0) {
      var file = this.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var csvContent = e.target.result;
        var lines = csvContent.split('\n');
        var participantes = [];

        for (var i = 0; i < lines.length; i++) {
          // Use vírgula como separador ao dividir a linha em células
          var row = lines[i].split(',');
          participantes.push(row);
        }

        exibirParticipantes(participantes);
      };
      reader.readAsText(file);
    }
  });

  // Adicione um evento de clique ao botão "Enviar"
  document.getElementById('uploadButton').addEventListener('click', function() {
    // Rolar para o topo ao clicar no botão "Enviar"
    window.scrollTo(0, 0);

    // Ocultar o botão personalizado "Escolher arquivo"
    document.getElementById('customFileInput').style.display = 'none';

    // Ocultar a div .botao-inicial-container
    document.querySelector('.botao-inicial-container').style.display = 'none';

    // Adicionar uma classe ao body para ocultar o elemento dateContainer
    document.body.classList.add('tabela-exibida');
  });

  // Selecionar o botão pelo seu seletor CSS
var button = document.querySelector('.botao-inicial');

// Adicionar um evento de clique e touchend ao botão
button.addEventListener('click', handleButtonClick);
button.addEventListener('touchend', handleButtonClick);

function handleButtonClick() {
  // Alterar a cor do botão para cinza escuro
  this.style.backgroundColor = '#ccc';

  // Aguardar 1 segundo (1000 milissegundos) antes de executar a função
  setTimeout(() => {
    // Alterar a cor do botão de volta ao normal
    this.style.backgroundColor = '';
  }, 1000);
}
});

window.addEventListener('DOMContentLoaded', function () {
  var dateContainer = document.getElementById('dateContainer');
  var currentDate = new Date();
  var formattedDate = currentDate.toLocaleDateString('pt-BR');
  dateContainer.textContent = formattedDate;
});

// Verifica se está em um dispositivo móvel
function isMobileDevice() {
  return window.innerWidth <= 768; // Defina a largura limite para dispositivos móveis
}

// Aplica estilos diferentes com base no dispositivo
function applyStylesBasedOnDevice() {
  if (isMobileDevice()) {
    // Estilos para dispositivos móveis
    document.getElementById('tabela-participantes').classList.add('mobile');
  } else {
    // Estilos para computadores
    document.getElementById('tabela-participantes').classList.remove('mobile');
  }
}

// Chama a função quando a página é carregada e redimensionada
window.addEventListener('load', applyStylesBasedOnDevice);
window.addEventListener('resize', applyStylesBasedOnDevice);

document.addEventListener('DOMContentLoaded', function() {
// Seleciona a tabela
var tabela = document.querySelector("#tabela-participantes");

// Conta o número de células na tabela
var numCelulas = tabela.querySelectorAll("td").length;

// Verifica se o número de células é igual a 37
if (numCelulas -= 37) {
  // Adiciona uma classe à tabela para aplicar estilos condicionalmente
  tabela.classList.add("tabela-ajustada");
}});
