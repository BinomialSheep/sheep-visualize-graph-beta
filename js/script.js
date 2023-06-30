const colorPallet = new Array('#b2cbe4', '#dfb7c8', '#decdb8', '#bcdacf');

const getNextColor = (nowColor) => {
  for (let i = 0; i < colorPallet.length; i++) {
    if (nowColor == colorPallet[i]) return colorPallet[++i % colorPallet.length];
  }
  return colorPallet[0];
};
const getPrevColor = (nowColor) => {
  for (let i = 0; i < colorPallet.length; i++) {
    if (nowColor == colorPallet[i]) return colorPallet[(--i + colorPallet.length) % colorPallet.length];
  }
  return colorPallet[0];
};

const addEvents = (network, data) => {
  // 頂点を左クリックで色の変更
  network.on('click', (params) => {
    if (params.nodes.length == 1) {
      let id = params.nodes[0];
      let nowColor = data.nodes.get(id).color;
      data.nodes.update({ id: id, color: getNextColor(nowColor) });
    }
  });
  // 頂点を右クリックで色の変更
  network.on('oncontext', (params) => {
    let id = network.getNodeAt(params.pointer.DOM); // NOTE 明示的に取得する必要がある
    if (id !== undefined) {
      let nowColor = data.nodes.get(id).color;
      data.nodes.update({ id: id, color: getPrevColor(nowColor) });
    }
  });
};

const makeGraph = (graph, format, data, option) => {
  // 頂点
  let nodeList = new Array(graph.N);
  for (let i = 0; i < graph.N; i++) {
    // 出力のindexed調整
    let label = (format.out_indexed == 'out_1_indexed' ? i + 1 : i).toString();
    nodeList[i] = { id: i, label: label, color: colorPallet[0] };
  }
  data.nodes = new vis.DataSet(nodeList);

  // 辺
  for (let i = 0; i < graph.M; i++) {
    if (format.direction == 'directed') {
      graph.E[i].arrows = 'to';
    } else if (format.direction == 'opposite_directed') {
      graph.E[i].arrows = 'from';
    }
  }
  // 頂点をクリックした際に辺の色が変わらないよう設定
  for (let i = 0; i < graph.M; i++) {
    graph.E[i].color = {
      color: 'blue',
      highlight: 'blue',
      hover: 'blue',
      inherit: false,
      opacity: 1.0,
    };
  }
  data.edges = new vis.DataSet(graph.E);
};

// 辺配列表現を正規化
const edgeListToNormalizedGraph = (element) => {
  let inList = element.value.split('\n');
  let line1 = inList[0].split(' ');
  let N = line1[0];
  let M = inList.length - 1;
  console.assert(line1[1] === undefined || line1[1] == M);
  let E = new Array(M);
  for (let i = 0; i < M; i++) {
    let list = inList[i + 1].split(' ');
    E[i] = { from: Number(list[0]), to: Number(list[1]) };
    // 重み付きの場合
    if (list.length >= 3) E[i].label = list[2];
  }
  return { N: N, M: M, E: E };
};
// 辺配列（転置）表現を正規化
const transposedEdgeListToNormalizedGraph = (element) => {
  let inList = element.value.split('\n');
  let line1 = inList[0].split(' ');
  let As = inList[1].split(' ');
  let Bs = inList[2].split(' ');
  let Cs = inList[3]?.split(' ');
  let N = line1[0];
  let M = As.length;
  console.assert(Bs.length == As.length);
  console.assert(line1[1] === undefined || line1[1] == As.length);
  console.assert(Cs === undefined || Cs.length == As.length);
  let E = new Array(M);
  for (let i = 0; i < M; i++) {
    E[i] = { from: Number(As[i]), to: Number(Bs[i]) };
    // 重み付きの場合
    if (Cs !== undefined) E[i].label = Cs[i];
  }
  return { N: N, M: M, E: E };
};

// 隣接リスト表現を正規化
const adjacencyListToNormalizedGraph = (element) => {
  let inList = element.value.split('\n');
  let line1 = inList[0].split(' ');
  let N = line1[0]; // XXX：1行目は頂点数と仮定
  let E = new Array();
  for (let i = 1; i < inList.length; i++) {
    let line = inList[i].split(' ');
    line.forEach((B) => E.push({ from: i, to: Number(B) }));
  }
  return { N: N, M: E.length, E: E };
};
// 隣接行列表現を正規化
const adjacencyMatrixToNormalizedGraph = (element) => {
  // XXX: 1が辺ありとみなす
  let inList = element.value.split('\n').filter((v) => v); // NOTE：空行削除
  let N = inList.length;
  let E = new Array();
  for (let i = 0; i < inList.length; i++) {
    let line = inList[i].split(' ');
    for (let j = 0; j < line.length; j++) {
      if (line[j] == 1) {
        E.push({ from: i + 1, to: j + 1 });
      }
    }
  }
  return { N: N, M: E.length, E: E };
};

const inputToNormalizedGraph = (format, element) => {
  let graph;
  if (format.graph_format == 'edge_list') graph = edgeListToNormalizedGraph(element);
  else if (format.graph_format == 'transposed_edge_list') graph = transposedEdgeListToNormalizedGraph(element);
  else if (format.graph_format == 'adjacency_list') graph = adjacencyListToNormalizedGraph(element);
  else if (format.graph_format == 'adjacency_matrix') graph = adjacencyMatrixToNormalizedGraph(element);
  else console.assert(false);

  // 入力のindex調整
  if (format.in_indexed == 'in_1_indexed')
    graph.E.forEach((e) => {
      e.from--, e.to--;
    });

  return graph;
};

const generateGraph = () => {
  // 入出力形式を取得
  let format = {
    direction: document.querySelector('input:checked[name*=direction]').value,
    graph_format: document.querySelector('input:checked[name*=graph_format]').value,
    in_indexed: document.querySelector('input:checked[name*=in_indexed]').value,
    out_indexed: document.querySelector('input:checked[name*=out_indexed]').value,
  };
  // テキストエリアの中身を取得
  let element = document.querySelector('#in_graph');

  // 入力をパースしてグラフの内部表現を統一
  let graph = inputToNormalizedGraph(format, element);

  // 描画用のグラフを生成
  let data = {};
  let option = {};
  makeGraph(graph, format, data, option);

  // ネットワークを描画
  let container = document.querySelector('#network');
  let network = new vis.Network(container, data, option);

  // グラフのクリックイベントの付与
  addEvents(network, data);
};

const initialize = (() => {
  // ツールチップの初期化
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

  // 出力キャンパス内では右クリックを禁止
  document.querySelector('#network').oncontextmenu = () => false;

  // ボタンのクリックイベントを付与
  document.querySelector('#in_graph_button').onclick = () => generateGraph();
})();
