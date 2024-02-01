class PlaceHolder {
  constructor() {
    // プレースホルダーを監視する
    document
      .querySelectorAll('input[name="graph_format"]')
      .forEach((radioButton) => radioButton.addEventListener('change', this.updateGraphFormatPlaceholder));
    // 初期状態
    this.updateGraphFormatPlaceholder();
  }

  EDGE_LIST_PLACE_HOLDER = `N (M)
A_1 B_1 (C_1)
A_2 B_2 (C_2)
...
A_M B_M (C_M)

頂点A_i, B_i間に辺があり、その重みがC_i
M, C_iは省略可能
`;

  TRANSPOSED_EDGE_LIST_PLACE_HOLDER = `N (M)
A_1 A_2 ... A_M
B_1 B_2 ... B_M
(C_1 C_2 ... C_M)

頂点A_i, B_i間に辺があり、その重みがC_i
M, C_iは省略可能
`;
  ADJACENCY_LIST_PLACE_HOLDER = `N
G_11 ... G_1i 
...
G_N1 ... G_Nj

隣接リスト表現。
WARN：各行の先頭で辺の数を指定する必要はない
`;
  ADJACENCY_MATRIX_PLACE_HOLDER = `N
G_11 ... G_1N 
...
G_N1 ... G_NN

隣接行列表現。
辺がある場合は1、辺がない場合は0
WARN：1, 0以外は辺なし扱い（重みではない）
`;
  PARENT_LIST_PLACE_HOLDER = `N
A_1 ... A_(N-1) (A_N)
(C_1 ... C_N)

親頂点を指す木構造表現。
2行目がN列の場合、-1か自分自身を指している頂点が根。
2行目がN-1列の場合、頂点1が根で固定。
C_iは重み。
A_N, C_iは省略可能
`;

  updateGraphFormatPlaceholder = () => {
    const graphFormat = document.querySelector('input:checked[name*=graph_format]').value;
    let placeHolderText = '';
    if (graphFormat == 'edge_list') placeHolderText = this.EDGE_LIST_PLACE_HOLDER;
    else if (graphFormat == 'transposed_edge_list') placeHolderText = this.TRANSPOSED_EDGE_LIST_PLACE_HOLDER;
    else if (graphFormat == 'adjacency_list') placeHolderText = this.ADJACENCY_LIST_PLACE_HOLDER;
    else if (graphFormat == 'adjacency_matrix') placeHolderText = this.ADJACENCY_MATRIX_PLACE_HOLDER;
    else if (graphFormat == 'parent_list') placeHolderText = this.PARENT_LIST_PLACE_HOLDER;
    else console.assert(false);
    document.querySelector('#in_graph').placeholder = placeHolderText;
  };
}
