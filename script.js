/* =========================================================
   DADOS FICTÍCIOS — 8º ANO
   Estes dados são apenas para demonstração.
   ========================================================= */
const dadosDisciplinas = [
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

/* =========================================================
   FUNÇÃO: normalizarNota(valor)
   Converte qualquer valor recebido para a escala 0–10.
   Retorna null quando a nota ainda não foi lançada.
   ========================================================= */
function normalizarNota(valor) {
  // vazio, null ou undefined → nota ainda não lançada
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // aceita vírgula como separador decimal
  let numero = typeof valor === "string"
    ? parseFloat(valor.replace(",", "."))
    : valor;

  // se não for número válido, ignora
  if (isNaN(numero)) {
    return null;
  }

  // valores entre 0 e 10 permanecem iguais
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // valores maiores que 10 e até 100 são divididos por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // fora das regras → inválido
  return null;
}

/* =========================================================
   FUNÇÃO: calcularMedia(notas)
   Recebe um array de notas já normalizadas (ou null)
   e calcula a média usando SOMENTE as notas disponíveis.
   ========================================================= */
function calcularMedia(notas) {
  // filtra apenas as notas válidas (não nulas)
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  // se nenhuma nota válida, retorna null
  if (validas.length === 0) {
    return null;
  }

  // soma todas as válidas e divide pela quantidade
  const soma = validas.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  return soma / validas.length;
}

/* =========================================================
   FUNÇÃO: somarFaltas(lista)
   Soma todos os números inteiros de um array de faltas.
   ========================================================= */
function somarFaltas(lista) {
  return lista.reduce(function (acc, n) {
    return acc + n;
  }, 0);
}

/* =========================================================
   FUNÇÃO: definirSituacao(media)
   Retorna a situação com base na média disponível.
   ========================================================= */
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

/* =========================================================
   FUNÇÃO: formatarNota(valor)
   Mostra a nota com uma casa decimal ou “Ainda não lançada”.
   ========================================================= */
function formatarNota(valor) {
  if (valor === null) {
    return "Ainda não lançada";
  }
  return valor.toFixed(1).replace(".", ",");
}

/* =========================================================
   FUNÇÃO: classeSituacao(situacao)
   Retorna a classe CSS correspondente à situação.
   ========================================================= */
function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

/* =========================================================
   PROCESSAMENTO DOS DADOS
   Aqui transformamos os dados brutos em informações prontas.
   ========================================================= */
const disciplinasProcessadas = dadosDisciplinas.map(function (item) {
  // normaliza cada trimestre
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  // média usando apenas as disponíveis
  const media = calcularMedia([n1, n2, n3]);

  // total de faltas
  const totalFaltas = somarFaltas(item.faltas);

  // situação
  const situacao = definirSituacao(media);

  return {
    disciplina: item.disciplina,
    n1: n1,
    n2: n2,
    n3: n3,
    media: media,
    faltas: totalFaltas,
    situacao: situacao
  };
});

/* =========================================================
   PREENCHER A TABELA
   ========================================================= */
const corpoTabela = document.getElementById("corpo-tabela");

disciplinasProcessadas.forEach(function (d) {
  // cria uma linha <tr>
  const linha = document.createElement("tr");

  linha.innerHTML =
    "<td>" + d.disciplina + "</td>" +
    "<td>" + formatarNota(d.n1) + "</td>" +
    "<td>" + formatarNota(d.n2) + "</td>" +
    "<td>" + formatarNota(d.n3) + "</td>" +
    "<td>" + formatarNota(d.media) + "</td>" +
    "<td>" + d.faltas + "</td>" +
    "<td class='" + classeSituacao(d.situacao) + "'>" + d.situacao + "</td>";

  corpoTabela.appendChild(linha);
});

/* =========================================================
   CARDS DE RESUMO
   Calcula os totais e monta os cards dinamicamente.
   ========================================================= */

// 1) Média geral (somente disciplinas com média disponível)
const mediasValidas = disciplinasProcessadas
  .map(function (d) { return d.media; })
  .filter(function (m) { return m !== null; });

const mediaGeral = mediasValidas.length > 0
  ? mediasValidas.reduce(function (a, b) { return a + b; }, 0) / mediasValidas.length
  : null;

// 2) Total geral de faltas
const totalFaltasGeral = disciplinasProcessadas.reduce(function (acc, d) {
  return acc + d.faltas;
}, 0);

// 3) Disciplinas com bom desempenho
const comBomDesempenho = disciplinasProcessadas.filter(function (d) {
  return d.situacao === "Bom desempenho";
}).length;

// 4) Disciplinas que precisam de atenção
const comAtencao = disciplinasProcessadas.filter(function (d) {
  return d.situacao === "Atenção";
}).length;

// 5) Frequência fictícia (apenas demonstrativa nesta versão)
//    No futuro esse valor será tratado de outra forma.
const frequenciaDemonstrativa = 92;

// Array com os cards que serão exibidos
const cards = [
  { titulo: "Média geral",                 valor: mediaGeral !== null ? mediaGeral.toFixed(1).replace(".", ",") : "—" },
  { titulo: "Total de faltas",             valor: totalFaltasGeral },
  { titulo: "Disciplinas com bom desempenho", valor: comBomDesempenho },
  { titulo: "Disciplinas que precisam de atenção", valor: comAtencao },
  { titulo: "Frequência demonstrativa",    valor: frequenciaDemonstrativa + "%", detalhe: "Frequência adequada" }
];

// Preenche a área dos cards
const areaCards = document.getElementById("cards");

cards.forEach(function (c) {
  const card = document.createElement("div");
  card.className = "card";

  let html = "<p class='titulo-card'>" + c.titulo + "</p>";
  html += "<p class='valor-card'>" + c.valor + "</p>";
  if (c.detalhe) {
    html += "<p class='detalhe-card'>" + c.detalhe + "</p>";
  }

  card.innerHTML = html;
  areaCards.appendChild(card);
});