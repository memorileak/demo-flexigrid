function flexiGrid({width, cols, rowHeight, gap}) {
  let _width = typeof width === 'number' ? width : 1280;
  let _cols = typeof cols === 'number' ? cols : 24;
  let _rowHeight = typeof rowHeight === 'number' ? rowHeight : 80;
  let _gap = typeof gap === 'number' ? gap : 5;
  let _previewPane = null;
  let _paneInPreview = null;
  const _paneSymbols = [];
  const _paneInstances = {};

  function cellIndiciesOfPane(paneInstance) {
    const [gridx, gridy] = paneInstance.grid_getxy();
    const [gridWidth, gridHeight] = paneInstance.grid_getWidthHeight();
    const result = [];
    for (let dy = 0; dy < gridHeight; dy += 1) {
      for (let dx = 0; dx < gridWidth; dx += 1) {
        result.push((gridx + dx) + _cols * (gridy + dy));
      }
    }
    return result;
  }

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

  function attachPreview(paneInstance) {
    _paneInPreview = paneInstance;
    _previewPane.grid_setxy(paneInstance.grid_getxy());
    _previewPane.grid_setWidthHeight(paneInstance.grid_getWidthHeight());
  }

  function detachPreview() {
    _paneInPreview = null;
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

  function grid_getGridHeight() {
    const [, gridMaxy] = grid_getxyOfPoint([0, px_getGridHeight()]);
    return gridMaxy + 1;
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

  function haveCollision() {
    const numberOfCells = _cols * grid_getGridHeight();
    const cdList = new Array(numberOfCells).fill(0);
    let panesToConsider = [];
    if (_paneInPreview) {
      panesToConsider = (
        _paneSymbols
          .filter((pSym) => (pSym !== _paneInPreview.getSymbol()))
          .map((pSym) => getPane(pSym))
      ).concat(
        [getPreviewPane()]
      );
    } else {
      panesToConsider = _paneSymbols.map((pSym) => getPane(pSym));
    }
    for (let i = 0; i < panesToConsider.length; i += 1) {
      const paneCellIndices = cellIndiciesOfPane(panesToConsider[i]);
      for (let cellIndexI = 0; cellIndexI < paneCellIndices.length; cellIndexI += 1) {
        cdList[paneCellIndices[cellIndexI]] += 1;
      }
    }
    return cdList.some((cdSum) => cdSum > 1);
  }

  const gridInstance = {
    getGridParams,
    getPaneSymbols,
    getPane,
    getPreviewPane,
    setPreviewPane,
    attachPreview,
    detachPreview,
    px_getCellSize,
    px_getGridHeight,
    px_calVector,
    grid_getxyOfPoint,
    grid_getGridHeight,
    grid_calVector,
    setGridParams,
    addPane,
    removePane,
    haveCollision,
  };

  return gridInstance;
};
