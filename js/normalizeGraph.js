// 辺配列表現を正規化
const edgeListToNormalizedGraph = (element) => {
  let inList = element.value.split('\n');
  let line1 = inList[0].split(' ');
  let N = Number(line1[0]);
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
  let N = Number(line1[0]);
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
  let N = Number(line1[0]); // XXX：1行目は頂点数と仮定
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
  let N = Number(inList.length);
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
// 親頂点配列表現を正規化
const parentListToNormalizedGraph = (element) => {
  let inList = element.value.split('\n');
  let line1 = inList[0].split(' ');
  let Ps = inList[1].split(' ');
  let Cs = inList[2]?.split(' ');

  let N = Number(line1[0]);
  let M = N - 1;
  let E = new Array();

  if (Ps.length == N - 1) {
    // 頂点1が根固定のパターン
    for (let i = 0; i < Ps.length; i++) {
      E.push({ from: Number(Ps[i]), to: i + 2 });
      // 重み付きの場合
      if (Cs !== undefined) E[i].label = Cs[i];
    }
  } else if (Ps.length == N) {
    // 特殊な入力が根のパターン（-1 or 自分自身を指していたら根）
    for (let i = 0; i < Ps.length; i++) {
      if (Ps[i] == -1) continue;
      if (Ps[i] == i + 1 && format.in_indexed == 'in_1_indexed') continue;
      if (Ps[i] == i && format.in_indexed == 'in_0_indexed') continue;
      E.push({ from: Number(Ps[i]), to: i + 1 });
      // 重み付きの場合
      if (Cs !== undefined) E[i].label = Cs[i];
    }
  } else {
    console.log('unreachable');
  }
  return { N: N, M: M, E: E };
};

const inputToNormalizedGraph = (format, element) => {
  let graph;
  if (format.graph_format == 'edge_list') graph = edgeListToNormalizedGraph(element);
  else if (format.graph_format == 'transposed_edge_list') graph = transposedEdgeListToNormalizedGraph(element);
  else if (format.graph_format == 'adjacency_list') graph = adjacencyListToNormalizedGraph(element);
  else if (format.graph_format == 'adjacency_matrix') graph = adjacencyMatrixToNormalizedGraph(element);
  else if (format.graph_format == 'parent_list') graph = parentListToNormalizedGraph(element);
  else console.assert(false);

  // 入力のindex調整
  if (format.in_indexed == 'in_1_indexed') {
    graph.E.forEach((e) => {
      e.from--, e.to--;
    });
  }

  // 辺にidを付与
  for (let i = 0; i < graph.E.length; i++) graph.E[i].id = i.toString();

  // 隣接辺idの構築（※from→toのみ）
  let connectedEdgeList = new Array(graph.N);
  for (let i = 0; i < connectedEdgeList.length; i++) connectedEdgeList[i] = new Array();
  graph.E.forEach((e) => connectedEdgeList[e.from].push(Number(e.id)));
  graph.connectedEdgeList = connectedEdgeList;

  // 隣接頂点リストの構築（※from←→to）
  let adjacencyList = new Array(graph.N);
  for (let i = 0; i < adjacencyList.length; i++) adjacencyList[i] = new Array();
  if (format.direction != 'opposite_directed') graph.E.forEach((e) => adjacencyList[e.from].push(Number(e.to)));
  if (format.direction != 'directed') graph.E.forEach((e) => adjacencyList[e.to].push(Number(e.from)));
  graph.adjacencyList = adjacencyList;

  return graph;
};
