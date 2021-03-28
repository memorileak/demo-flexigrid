function flexiGrid({width, cols, rowHeight, gap}) {
  let _width = typeof width === 'number' ? width : 1280;
  let _cols = typeof cols === 'number' ? cols : 24;
  let _rowHeight = typeof rowHeight === 'number' ? rowHeight : 80;
  let _gap = typeof gap === 'number' ? gap : 5;
  let _previewPane = null;
  const _paneSymbols = [];
  const _paneInstances = {};

  function getGridParams() {
    return {
      width: _width,
      cols: _cols,
      rowHeight: _rowHeight,
      gap: _gap,
    };
  }

  function getPaneSymbols() {
    return [..._paneSymbols];
  }

  function getPane(paneSymbol) {
    return _paneInstances[paneSymbol] || null; 
  }

  function getPreviewPane() {
    return _previewPane;
  }

  function setPreviewPane(previewPane) {
    const previewPaneSymbol = Symbol();
    _previewPane = previewPane;
    previewPane.belongsToGrid(gridInstance, previewPaneSymbol);
    return previewPaneSymbol;
  }

  function previewForPane(paneInstance) {
    _previewPane.grid_setxy(paneInstance.grid_getxy());
    _previewPane.grid_setWidthHeight(paneInstance.grid_getWidthHeight());
  }

  function px_getCellSize() {
    const cellWidth = (_width - _gap * (_cols - 1)) / _cols;
    const cellHeight = _rowHeight;
    return [cellWidth, cellHeight];
  }

  function px_getGridHeight() {
    let height = 0;
    for (let i = 0; i < _paneSymbols.length; i += 1) {
      const [, bry] = getPane(_paneSymbols[i]).px_getBottomRightxy();
      height = (height < bry) ? bry : height;
    }
    return height;
  }

  function px_calVector([pxFromx, pxFromy], [pxTox, pxToy]) {
    return [pxTox - pxFromx, pxToy - pxFromy];
  }

  function grid_getxyOfPoint([pxx, pxy]) {
    const cellSize = px_getCellSize();
    const gridx = Math.floor(pxx / (cellSize[0] + _gap));
    const gridy = Math.floor(pxy / (cellSize[1] + _gap));
    return [gridx, gridy];
  }

  function grid_calVector([pxFromx, pxFromy], [pxTox, pxToy]) {
    const [gridFromx, gridFromy] = grid_getxyOfPoint([pxFromx, pxFromy]);
    const [gridTox, gridToy] = grid_getxyOfPoint([pxTox, pxToy]);
    return [gridTox - gridFromx, gridToy - gridFromy];
  }

  function setGridParams({width, cols, rowHeight, gap}) {
    if (typeof width === 'number') {
      _width = width;
    }
    if (typeof cols === 'number') {
      _cols = cols;
    }
    if (typeof rowHeight === 'number') {
      _rowHeight = rowHeight;
    }
    if (typeof gap === 'number') {
      _gap = gap;
    }
  }

  function addPane(newPane) {
    const paneSymbol = Symbol();
    _paneSymbols.push(paneSymbol);
    _paneInstances[paneSymbol] = newPane;
    newPane.belongsToGrid(gridInstance, paneSymbol);
    return paneSymbol;
  }

  function removePane(paneSymbol) {
    const paneSymbolIndex = _paneSymbols.findIndex((sym) => sym === paneSymbol);
    _paneSymbols.splice(paneSymbolIndex, 1);
    _paneInstances[paneSymbol].belongsToGrid(null, null);
    delete _paneInstances[paneSymbol];
  }

  const gridInstance = {
    getGridParams,
    getPaneSymbols,
    getPane,
    getPreviewPane,
    setPreviewPane,
    previewForPane,
    px_getCellSize,
    px_getGridHeight,
    px_calVector,
    grid_getxyOfPoint,
    grid_calVector,
    setGridParams,
    addPane,
    removePane,
  };

  return gridInstance;
};
