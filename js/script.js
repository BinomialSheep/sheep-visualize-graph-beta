const makeGraph = (N, M, E, data, options, format) => {
  // 頂点
  let nodeList = new Array(N);
  for (let i = 0; i < N; i++) {
    // 出力のindexed調整
    let label = (format.out_indexed == 'out_1_indexed' ? i + 1 : i).toString();
    nodeList[i] = { id: i, label: label };
  }
  data.nodes = new vis.DataSet(nodeList);

  // 辺
  for (let i = 0; i < M; i++) {
    if (format.direction == 'directed') {
      E[i].arrows = 'to';
    } else if (format.direction == 'opposite_directed') {
      E[i].arrows = 'from';
    }
  }
  data.edges = new vis.DataSet(E);
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

  // 入力をパースしてグラフを生成
  // TODO: 辺配列以外の入力形式にも対応
  let inList = element.value.split('\n');
  let line1 = inList[0].split(' ');
  let N = line1[0],
    M = inList.length - 1;
  console.assert(line1[1] === undefined || line1[1] == M);
  let E = new Array(M);
  for (let i = 0; i < M; i++) {
    let list = inList[i + 1].split(' ');
    let A = list[0],
      B = list[1];
    if (format.in_indexed == 'in_1_indexed') A--, B--;
    E[i] = { from: A, to: B };
    // 重み付きの場合
    if (list.length >= 3) E[i].label = list[2];
  }

  // 描画用のグラフを生成
  let data = {};
  let option = {};
  makeGraph(N, M, E, data, option, format);

  // ネットワークを描画
  let container = document.querySelector('#network');
  let network = new vis.Network(container, data, option);
};
