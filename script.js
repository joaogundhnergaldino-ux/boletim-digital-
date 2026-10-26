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