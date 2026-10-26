/* =========================================================
   CONFIGURAÇÃO FIXA DO ALUNO
   ========================================================= */
const CONFIG_ALUNO = {
  turma: "8C",
  numeroChamada: 11,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* =========================================================
   DADOS FICTÍCIOS — LOCAL (8º ANO)
   Utilizados apenas quando a API não possuir dados salvos.
   ========================================================= */
const dadosDisciplinasLocais = [
  { disciplina: "Língua Portuguesa",        tri1: 82,   tri2: "7,8", tri3: 85,   faltas: [2, 1, 1] },
  { disciplina: "Matemática",               tri1: 52,   tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências",                 tri1: "8,1",tri2: 76,    tri3: 8.0,  faltas: [1, 2, 0] },
  { disciplina: "História",                 tri1: 7.0,  tri2: 84,    tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia",                tri1: 68,   tri2: 7.3,   tri3: "7,9",faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa",           tri1: 86,   tri2: "8,1", tri3: 8.7,  faltas: [1, 0, 0] },
  { disciplina: "Arte",                     tri1: 9.0,  tri2: 92,    tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física",          tri1: 95,   tri2: 9.0,   tri3: "9,4",faltas: [0, 1, 0] },
  { disciplina: "Educação Digital",         tri1: 88,   tri2: 9.1,   tri3: 93,   faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira",      tri1: 74,   tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado",         tri1: 8.0,  tri2: 83,    tri3: "8,5",faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura",        tri1: 62,   tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico",        tri1: 48,   tri2: 5.6,   tri3: "6,0",faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais",   tri1: 58,   tri2: "6,2", tri3: 6.4,  faltas: [1, 1, 1] }
];

/* Média mínima de referência */
const MEDIA_MINIMA = 6.0;

/* Variáveis de Sessão (PIN mantido apenas em memória) */
let pinSessao = "";
let listaDisciplinasAtual = [];

/* =========================================================
   INSTÂNCIAS DOS GRÁFICOS (ECLUSIVAS PARA OS GRÁFICOS)
   ========================================================= */
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

/* =========================================================
   FUNÇÕES DE NORMALIZAÇÃO E CÁLCULO
   ========================================================= */

// Normalização para dados legados (aceita 75 -> 7.5, "7,8" -> 7.8, etc.)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  let numero = typeof valor === "string"
    ? parseFloat(valor.replace(",", "."))
    : valor;

  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

function calcularMedia(notas) {
  const validas = notas.filter(function (n) { return n !== null; });
  if (validas.length === 0) return null;
  const soma = validas.reduce(function (acc, n) { return acc + n; }, 0);
  return soma / validas.length;
}

function somarFaltas(lista) {
  if (!Array.isArray(lista)) return 0;
  return lista.reduce(function (acc, n) {
    const val = parseInt(n, 10);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

function formatarNota(valor) {
  if (valor === null) return "Ainda não lançada";
  return valor.toFixed(1).replace(".", ",");
}

function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

/* =========================================================
   RENDERIZAÇÃO DA TELA
   ========================================================= */

function renderizarBoletim(disciplinasBrutas) {
  // Processamento seguro dos dados
  const disciplinasProcessadas = disciplinasBrutas.map(function (item) {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);
    const faltasArray = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltas = somarFaltas(faltasArray);
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina || "Sem nome",
      n1: n1,
      n2: n2,
      n3: n3,
      media: media,
      faltas: totalFaltas,
      situacao: situacao
    };
  });

  // Limpa tabela
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.textContent = "";

  // Preenche tabela usando métodos seguros de DOM
  disciplinasProcessadas.forEach(function (d) {
    const linha = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;
    linha.appendChild(tdNome);

    const tdN1 = document.createElement("td");
    tdN1.textContent = formatarNota(d.n1);
    linha.appendChild(tdN1);

    const tdN2 = document.createElement("td");
    tdN2.textContent = formatarNota(d.n2);
    linha.appendChild(tdN2);

    const tdN3 = document.createElement("td");
    tdN3.textContent = formatarNota(d.n3);
    linha.appendChild(tdN3);

    const tdMedia = document.createElement("td");
    tdMedia.textContent = formatarNota(d.media);
    linha.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = d.faltas;
    linha.appendChild(tdFaltas);

    const tdSit = document.createElement("td");
    tdSit.textContent = d.situacao;
    tdSit.className = classeSituacao(d.situacao);
    linha.appendChild(tdSit);

    corpoTabela.appendChild(linha);
  });

  // Preenche Cards
  const mediasValidas = disciplinasProcessadas
    .map(function (d) { return d.media; })
    .filter(function (m) { return m !== null; });

  const mediaGeral = mediasValidas.length > 0
    ? mediasValidas.reduce(function (a, b) { return a + b; }, 0) / mediasValidas.length
    : null;

  const totalFaltasGeral = disciplinasProcessadas.reduce(function (acc, d) {
    return acc + d.faltas;
  }, 0);

  const comBomDesempenho = disciplinasProcessadas.filter(function (d) {
    return d.situacao === "Bom desempenho";
  }).length;

  const comAtencao = disciplinasProcessadas.filter(function (d) {
    return d.situacao === "Atenção";
  }).length;

  const frequenciaDemonstrativa = 92;

  const cards = [
    { titulo: "Média geral", valor: mediaGeral !== null ? mediaGeral.toFixed(1).replace(".", ",") : "—" },
    { titulo: "Total de faltas", valor: totalFaltasGeral },
    { titulo: "Disciplinas com bom desempenho", valor: comBomDesempenho },
    { titulo: "Disciplinas que precisam de atenção", valor: comAtencao },
    { titulo: "Frequência demonstrativa", valor: frequenciaDemonstrativa + "%", detalhe: "Frequência adequada" }
  ];

  const areaCards = document.getElementById("cards");
  areaCards.textContent = "";

  cards.forEach(function (c) {
    const card = document.createElement("div");
    card.className = "card";

    const pTitulo = document.createElement("p");
    pTitulo.className = "titulo-card";
    pTitulo.textContent = c.titulo;
    card.appendChild(pTitulo);

    const pValor = document.createElement("p");
    pValor.className = "valor-card";
    pValor.textContent = c.valor;
    card.appendChild(pValor);

    if (c.detalhe) {
      const pDetalhe = document.createElement("p");
      pDetalhe.className = "detalhe-card";
      pDetalhe.textContent = c.detalhe;
      card.appendChild(pDetalhe);
    }

    areaCards.appendChild(card);
  });

  // Atualização pontual da camada visual de gráficos (após carregar/salvar dados)
  atualizarGraficos();
}

/* =========================================================
   FUNÇÕES EXCLUSIVAS DE GRÁFICOS (SOMENTE LEITURA)
   ========================================================= */

function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas) return;

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  const rotulos = [];
  const valoresMedias = [];

  listaDisciplinasAtual.forEach(function (d) {
    rotulos.push(d.disciplina || "Sem nome");
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    const media = calcularMedia([n1, n2, n3]);
    valoresMedias.push(media !== null ? parseFloat(media.toFixed(1)) : null);
  });

  const ctx = canvas.getContext("2d");
  graficoMedias = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [{
        label: "Média Atual",
        data: valoresMedias,
        backgroundColor: "#6a0dad",
        borderColor: "#8e44ad",
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1, color: "#222" },
          grid: { color: "#dcdcdc" }
        },
        y: {
          ticks: { color: "#222", font: { size: 11 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Sem nota";
              return " Média: " + val.toFixed(1).replace(".", ",");
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas) return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  const notasTri1 = [];
  const notasTri2 = [];
  const notasTri3 = [];

  listaDisciplinasAtual.forEach(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    if (n1 !== null) notasTri1.push(n1);
    if (n2 !== null) notasTri2.push(n2);
    if (n3 !== null) notasTri3.push(n3);
  });

  const m1 = calcularMedia(notasTri1);
  const m2 = calcularMedia(notasTri2);
  const m3 = calcularMedia(notasTri3);

  const dadosEvolucao = [
    m1 !== null ? parseFloat(m1.toFixed(1)) : null,
    m2 !== null ? parseFloat(m2.toFixed(1)) : null,
    m3 !== null ? parseFloat(m3.toFixed(1)) : null
  ];

  const ctx = canvas.getContext("2d");
  graficoEvolucao = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média Geral",
        data: dadosEvolucao,
        borderColor: "#8e44ad",
        backgroundColor: "rgba(142, 68, 173, 0.15)",
        borderWidth: 3,
        pointBackgroundColor: "#6a0dad",
        pointRadius: 5,
        fill: true,
        tension: 0.2,
        spanGaps: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1, color: "#222" },
          grid: { color: "#dcdcdc" }
        },
        x: {
          ticks: { color: "#222" },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Média não disponível";
              return " Média Geral: " + val.toFixed(1).replace(".", ",");
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas) return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  let faltasTri1 = 0;
  let faltasTri2 = 0;
  let faltasTri3 = 0;

  listaDisciplinasAtual.forEach(function (d) {
    const f = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];
    const f1 = parseInt(f[0], 10);
    const f2 = parseInt(f[1], 10);
    const f3 = parseInt(f[2], 10);

    faltasTri1 += isNaN(f1) ? 0 : f1;
    faltasTri2 += isNaN(f2) ? 0 : f2;
    faltasTri3 += isNaN(f3) ? 0 : f3;
  });

  const totalFaltasInterno = faltasTri1 + faltasTri2 + faltasTri3;

  const elementoEstado = document.getElementById("estadoFaltas");
  const cardFaltas = document.getElementById("cardFaltas");

  if (elementoEstado && cardFaltas) {
    elementoEstado.textContent = "";
    cardFaltas.classList.remove("card-perigo");

    // Referência interna de risco crítica (350 faltas)
    if (totalFaltasInterno >= 350) {
      const badge = document.createElement("span");
      badge.className = "badge-perigo";
      badge.textContent = "Perigo";
      elementoEstado.appendChild(badge);
      cardFaltas.classList.add("card-perigo");
    }
  }

  const ctx = canvas.getContext("2d");
  graficoFaltas = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Faltas",
        data: [faltasTri1, faltasTri2, faltasTri3],
        backgroundColor: "#6a0dad",
        borderColor: "#8e44ad",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: "#222" },
          grid: { color: "#dcdcdc" }
        },
        x: {
          ticks: { color: "#222" },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return " " + context.raw + " faltas";
            }
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

/* =========================================================
   CONEXÃO COM A API — AUTENTICAÇÃO (ABRIR)
   ========================================================= */

const btnEntrar = document.getElementById("btn-entrar");
const campoPin = document.getElementById("campo-pin");
const msgLogin = document.getElementById("msg-login");

btnEntrar.addEventListener("click", realizarLogin);
campoPin.addEventListener("keypress", function (e) {
  if (e.key === "Enter") realizarLogin();
});

function realizarLogin() {
  const pinDigitado = campoPin.value.trim();
  if (!pinDigitado) {
    exibirMensagem(msgLogin, "Por favor, digite seu PIN.", "erro");
    return;
  }

  exibirMensagem(msgLogin, "Conectando...", "");

  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinDigitado
    })
  })
  .then(function (res) {
    if (res.status === 401) {
      throw new Error("Turma, chamada ou PIN inválidos.");
    }
    if (res.status === 429) {
      throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
    }
    if (!res.ok) {
      throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
    }
    return res.json();
  })
  .then(function (resposta) {
    pinSessao = pinDigitado;
    campoPin.value = "";

    if (resposta && resposta.dados && Array.isArray(resposta.dados.disciplinas) && resposta.dados.disciplinas.length > 0) {
      listaDisciplinasAtual = resposta.dados.disciplinas;
    } else {
      listaDisciplinasAtual = dadosDisciplinasLocais;
    }

    document.getElementById("area-login").style.display = "none";
    document.getElementById("area-boletim").style.display = "block";
    renderizarBoletim(listaDisciplinasAtual);
  })
  .catch(function (err) {
    exibirMensagem(msgLogin, err.message || "Não foi possível conectar ao servidor. Tente novamente.", "erro");
  });
}

function exibirMensagem(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = "mensagem-status " + (tipo || "");
}

/* =========================================================
   EDIÇÃO E VALIDAÇÃO DAS NOTAS/FALTAS
   ========================================================= */

const btnAlternarEdicao = document.getElementById("btn-alternar-edicao");
const areaEdicao = document.getElementById("area-edicao");
const btnCancelar = document.getElementById("btn-cancelar");
const btnSalvar = document.getElementById("btn-salvar");
const msgEdicao = document.getElementById("msg-edicao");
const corpoEdicao = document.getElementById("corpo-tabela-edicao");

btnAlternarEdicao.addEventListener("click", abrirEdicao);
btnCancelar.addEventListener("click", fecharEdicao);
btnSalvar.addEventListener("click", salvarAlteracoes);

function abrirEdicao() {
  corpoEdicao.textContent = "";
  msgEdicao.textContent = "";

  listaDisciplinasAtual.forEach(function (d, idx) {
    const tr = document.createElement("tr");

    // Nome
    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;
    tr.appendChild(tdNome);

    // Tri 1, 2, 3
    const n1Norm = normalizarNota(d.tri1);
    const n2Norm = normalizarNota(d.tri2);
    const n3Norm = normalizarNota(d.tri3);

    tr.appendChild(criarCellInput("nota", n1Norm !== null ? n1Norm : "", idx, "tri1"));
    tr.appendChild(criarCellInput("nota", n2Norm !== null ? n2Norm : "", idx, "tri2"));
    tr.appendChild(criarCellInput("nota", n3Norm !== null ? n3Norm : "", idx, "tri3"));

    // Faltas 1, 2, 3
    const f = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];
    tr.appendChild(criarCellInput("falta", f[0] !== undefined ? f[0] : 0, idx, "f1"));
    tr.appendChild(criarCellInput("falta", f[1] !== undefined ? f[1] : 0, idx, "f2"));
    tr.appendChild(criarCellInput("falta", f[2] !== undefined ? f[2] : 0, idx, "f3"));

    corpoEdicao.appendChild(tr);
  });

  areaEdicao.style.display = "block";
}

function criarCellInput(tipo, valor, idx, campo) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = "text";
  input.value = valor !== null && valor !== undefined ? valor : "";
  input.dataset.tipo = tipo;
  input.dataset.idx = idx;
  input.dataset.campo = campo;

  input.addEventListener("input", function() {
    input.classList.remove("campo-invalido");
  });

  td.appendChild(input);
  return td;
}

function fecharEdicao() {
  areaEdicao.style.display = "none";
  msgEdicao.textContent = "";
}

function salvarAlteracoes() {
  const inputs = corpoEdicao.querySelectorAll("input");
  let temErro = false;

  // 1. Validação Visual
  inputs.forEach(function (input) {
    const tipo = input.dataset.tipo;
    const val = input.value.trim();

    if (val === "") return;

    if (tipo === "nota") {
      const num = parseFloat(val.replace(",", "."));
      if (isNaN(num) || num < 0 || num > 10) {
        input.classList.add("campo-invalido");
        temErro = true;
      }
    } else if (tipo === "falta") {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0 || num.toString() !== val) {
        input.classList.add("campo-invalido");
        temErro = true;
      }
    }
  });

  if (temErro) {
    exibirMensagem(msgEdicao, "Corrija os campos destacados em vermelho.", "erro");
    return;
  }

  // 2. Montagem dos novos dados em cópia profunda
  const novasDisciplinas = JSON.parse(JSON.stringify(listaDisciplinasAtual));

  inputs.forEach(function (input) {
    const idx = parseInt(input.dataset.idx, 10);
    const campo = input.dataset.campo;
    const val = input.value.trim();

    if (campo.startsWith("tri")) {
      novasDisciplinas[idx][campo] = val === "" ? null : parseFloat(val.replace(",", "."));
    } else if (campo.startsWith("f")) {
      if (!Array.isArray(novasDisciplinas[idx].faltas)) {
        novasDisciplinas[idx].faltas = [0, 0, 0];
      }
      const pos = parseInt(campo.replace("f", ""), 10) - 1;
      novasDisciplinas[idx].faltas[pos] = val === "" ? 0 : parseInt(val, 10);
    }
  });

  exibirMensagem(msgEdicao, "Salvando alterações...", "");

  // 3. Envio para a API
  fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinSessao,
      dados: { disciplinas: novasDisciplinas }
    })
  })
  .then(function (res) {
    if (!res.ok) {
      throw new Error("Erro ao salvar os dados no servidor.");
    }
    return res.json();
  })
  .then(function () {
    listaDisciplinasAtual = novasDisciplinas;
    renderizarBoletim(listaDisciplinasAtual);
    fecharEdicao();
  })
  .catch(function (err) {
    exibirMensagem(msgEdicao, err.message || "Erro ao salvar os dados.", "erro");
  });
}