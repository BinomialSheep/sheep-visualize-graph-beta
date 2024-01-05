const addEvents = () => {
  if (this.network == undefined) return;

  this.network.off('click');
  this.network.off('oncontext');

  if (this.click_kind == 'color') {
    // 頂点を左クリックで色の変更
    this.network.on('click', (params) => {
      if (params.nodes.length == 1) {
        let id = params.nodes[0];
        let nowColor = this.data.nodes.get(id).color;
        this.data.nodes.update({ id: id, color: getNextColor(nowColor) });
      }
    });
    // 頂点を右クリックで色の変更
    this.network.on('oncontext', (params) => {
      let id = this.network.getNodeAt(params.pointer.DOM); // NOTE 明示的に取得する必要がある
      if (id !== undefined) {
        let nowColor = this.data.nodes.get(id).color;
        this.data.nodes.update({ id: id, color: getPrevColor(nowColor) });
      }
    });
  } else if (this.click_kind == 'depth') {
    // 頂点を左クリックでその頂点を深さ0としてDFS
    this.network.on('click', (params) => {
      if (params.nodes.length == 1) {
        let startId = params.nodes[0];

        // console.log(this.graph.levelList);
        makeTree(startId);
        // console.log(this.graph.levelList);
        // for (let i = 0; i < this.graph.N; i++) {
        //   let level = this.graph.levelList?.[i];
        //   this.data.nodes.update({ id: i, level: level });
        // }
        makeGraph();

        // ネットワークを描画
        this.network = new vis.Network(container, this.data, this.option);
        addEvents();
      }
    });
  }
};

const makeGraph = () => {
  // 頂点
  let nodeList = new Array(this.graph.N);
  for (let i = 0; i < this.graph.N; i++) {
    // 出力のindexed調整
    let label = (this.format.out_indexed == 'out_1_indexed' ? i + 1 : i).toString();
    // 出力の配置
    let level = this.graph.levelList?.[i];
    // 色
    let color = this.data.nodes?.get(i).color;
    if (color == undefined) color = colorPallet[0];

    nodeList[i] = {
      id: i,
      label: label,
      level: level,
      color: color,
    };
  }
  this.data.nodes = new vis.DataSet(nodeList);

  // 辺
  for (let i = 0; i < this.graph.M; i++) {
    if (this.format.direction == 'directed') {
      this.graph.E[i].arrows = 'to';
    } else if (this.format.direction == 'opposite_directed') {
      this.graph.E[i].arrows = 'from';
    }
  }
  // 頂点をクリックした際に辺の色が変わらないよう設定
  for (let i = 0; i < this.graph.M; i++) {
    this.graph.E[i].color = {
      color: 'blue',
      highlight: 'blue',
      hover: 'blue',
      inherit: false,
      opacity: 1.0,
    };
  }
  this.data.edges = new vis.DataSet(this.graph.E);
};

const makeTree = (start) => {
  let queue = new myQueue();
  let levelList = new Array(this.graph.N);
  levelList[start] = 0;
  queue.push(start);
  for (let i = 0; ; i++) {
    while (!queue.empty()) {
      const v = queue.front();
      queue.pop();
      this.graph.adjacencyList[v].forEach((u) => {
        if (levelList[u] == undefined) {
          levelList[u] = levelList[v] + 1;
          queue.push(u);
        }
      });
    }
    if (i == this.graph.N) break;
    if (levelList[i] == undefined) {
      levelList[i] = 0;
      queue.push(i);
    }
  }

  this.graph.levelList = levelList;
  // オプション
  this.option.layout = {
    hierarchical: {
      enabled: true,
      direction: 'LR',
      sortMethod: 'directed',
    },
  };
};

const generateGraph = () => {
  // 入出力形式を取得
  this.format = {
    direction: document.querySelector('input:checked[name*=direction]').value,
    graph_format: document.querySelector('input:checked[name*=graph_format]').value,
    in_indexed: document.querySelector('input:checked[name*=in_indexed]').value,
    out_indexed: document.querySelector('input:checked[name*=out_indexed]').value,
  };
  // テキストエリアの中身を取得
  let element = document.querySelector('#in_graph');

  // 入力をパースしてグラフの内部表現を統一
  this.graph = inputToNormalizedGraph(this.format, element);
  this.graph.levelList = new Array(this.graph.N);
  for (let i = 0; i < this.graph.N; i++) this.graph.levelList[i] = 0;

  // vis.js用の変数
  this.data = {};
  this.option = {};
  //
  this.click_kind = document.querySelector('input:checked[name*=click_kind]').value;
  if (this.click_kind == 'depth') {
    makeTree(0);
  }

  // 描画用のグラフを生成
  makeGraph();

  // ネットワークを描画
  this.container = document.querySelector('#network');
  this.network = new vis.Network(container, this.data, this.option);

  // グラフのクリックイベントの付与
  addEvents();
};

const initialize = (() => {
  // ツールチップの初期化
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

  // 出力キャンパス内では右クリックを禁止
  document.querySelector('#network').oncontextmenu = () => false;

  //
  this.network = undefined;
  this.data = undefined;
  this.option = undefined;

  // ボタンのクリックイベントを付与
  document.querySelector('#in_graph_button').onclick = () => generateGraph();
  document.querySelector('#click_color').onclick = () => {
    this.click_kind = document.querySelector('input:checked[name*=click_kind]').value;
    addEvents();
  };
  document.querySelector('#click_depth').onclick = () => {
    this.click_kind = document.querySelector('input:checked[name*=click_kind]').value;
    addEvents();
  };
})();
