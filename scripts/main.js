function mmToPt(mm) {
  return mm * 2.835; // 1 mm = 2.835 pt
}

window.addEventListener('load', function() {
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  document.getElementById('fileInput').addEventListener('change', function () {
    if (this.files.length > 0) {
      var file = this.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var csvContent = e.target.result;
        var lines = csvContent.split('\n');
        var participantes = [];
  
        var startIndex = lines.findIndex(line => line.startsWith('Informação Assistência'));
        startIndex += 2;
  
        for (var i = startIndex; i < lines.length; i++) {
          // Use uma expressão regular para dividir a linha considerando as vírgulas dentro de aspas duplas
          var row = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
          // Remova as aspas duplas dos valores se existirem
          row = row.map(value => value.replace(/^"|"$/g, ''));
          if (row.length < 5) break;
          participantes.push(row);
        }
  
        exibirParticipantes(participantes);
      };
      reader.readAsText(file);
    }
  });  

  document.getElementById('uploadButton').addEventListener('click', function() {
    window.scrollTo(0, 0);
    document.getElementById('customFileInput').style.display = 'none';
    document.querySelector('.botao-inicial-container').style.display = 'none';
    document.body.classList.add('tabela-exibida');
  });

  var button = document.querySelector('.botao-inicial');

  button.addEventListener('click', handleButtonClick);
  button.addEventListener('touchend', handleButtonClick);

  function handleButtonClick() {
    this.style.backgroundColor = '#ccc';
    setTimeout(() => {
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

function isMobileDevice() {
  return window.innerWidth <= 768;
}

function applyStylesBasedOnDevice() {
  if (isMobileDevice()) {
    document.getElementById('tabela-participantes').classList.add('mobile');
  } else {
    document.getElementById('tabela-participantes').classList.remove('mobile');
  }
}

window.addEventListener('load', applyStylesBasedOnDevice);
window.addEventListener('resize', applyStylesBasedOnDevice);

document.addEventListener('DOMContentLoaded', function() {
  var tabela = document.querySelector("#tabela-participantes");

  var numCelulas = tabela.querySelectorAll("td").length;

  if (numCelulas -= 37) {
    tabela.classList.add("tabela-ajustada");
  }
});
