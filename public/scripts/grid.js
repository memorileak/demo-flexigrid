function flexiGrid({width, cols, rowHeight, gap}) {
  let _width = typeof width === 'number' ? width : 1280;
  let _cols = typeof cols === 'number' ? cols : 24;
  let _rowHeight = typeof rowHeight === 'number' ? rowHeight : 80;
  let _gap = typeof gap === 'number' ? gap : 5;
  const _paneSymbols = [];
  const _state = {};

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
    return _state[paneSymbol] || null; 
  }

  function px_getCellSize() {
    const cellWidth = (_width - _gap * (_cols - 1)) / _cols;
    const cellHeight = _rowHeight;
    return [cellWidth, cellHeight];
  }

  function px_getGridHeight() {
    let height = 0;
    for (let i = 0; i < _paneSymbols.length; i += 1) {
      const [, bry] = getPane(_paneSymbols[i]).px_getBottomRightxy(gridInstance);
      height = (height < bry) ? bry : height;
    }
    return height;
  }

  function showState() {
    console.log(state);
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
    _state[paneSymbol] = newPane;
    return paneSymbol;
  }

  function removePane(paneSymbol) {
    const paneSymbolIndex = _paneSymbols.findIndex((sym) => sym === paneSymbol);
    _paneSymbols.splice(paneSymbolIndex, 1);
    delete _state[paneSymbol];
  }

  const gridInstance = {
    getGridParams,
    getPaneSymbols,
    getPane,
    px_getCellSize,
    px_getGridHeight,
    showState,
    setGridParams,
    addPane,
    removePane,
  };

  return gridInstance;
};
