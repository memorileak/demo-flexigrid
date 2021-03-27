function flexiPane({onGridx, onGridy, onGridWidth, onGridHeight}) {
  let _onGridx = typeof onGridx === 'number' ? onGridx : 0;
  let _onGridy = typeof onGridy === 'number' ? onGridy : 0;
  let _onGridWidth = typeof onGridWidth === 'number' ? onGridWidth : 2;
  let _onGridHeight = typeof onGridHeight === 'number' ? onGridHeight : 2;
  let _gridInstance = null;
  let _ownSymbol = null;

  function getSymbol() {
    return _ownSymbol;
  }

  function belongsToGrid(gridInstance, ownSymbol) {
    _gridInstance = gridInstance;
    _ownSymbol = ownSymbol;
  }

  function fitToSlot() {
    _onGridx = Math.round(_onGridx);
    _onGridy = Math.round(_onGridy);
    _onGridWidth = Math.round(_onGridWidth);
    _onGridHeight = Math.round(_onGridHeight);
  }

  function px_getxy() {
    const cellSize = _gridInstance.px_getCellSize();
    const gridParams = _gridInstance.getGridParams();
    const x = _onGridx * (cellSize[0] + gridParams.gap);
    const y = _onGridy * (cellSize[1] + gridParams.gap);
    return [x, y];
  }

  function px_getWidthHeight() {
    const cellSize = _gridInstance.px_getCellSize();
    const gridParams = _gridInstance.getGridParams();
    const width = _onGridWidth * cellSize[0] + (_onGridWidth - 1) * gridParams.gap;
    const height = _onGridHeight * cellSize[1] + (_onGridHeight - 1) * gridParams.gap;
    return [width, height];
  }

  function px_getBottomRightxy() {
    const cellSize = _gridInstance.px_getCellSize();
    const gridParams = _gridInstance.getGridParams();
    const topLeftx = _onGridx * (cellSize[0] + gridParams.gap);
    const topLefty = _onGridy * (cellSize[1] + gridParams.gap);
    const width = _onGridWidth * cellSize[0] + (_onGridWidth - 1) * gridParams.gap;
    const height = _onGridHeight * cellSize[1] + (_onGridHeight - 1) * gridParams.gap;
    return [topLeftx + width, topLefty + height];
  }

  function px_setxy([pxx, pxy]) {
    if (typeof pxx === 'number' && typeof pxy === 'number') {
      const cellSize = _gridInstance.px_getCellSize();
      const gridParams = _gridInstance.getGridParams();
      _onGridx = pxx / (cellSize[0] + gridParams.gap);
      _onGridy = pxy / (cellSize[1] + gridParams.gap);
    } else {
      console.error('Pane.px_setxy: x, y must be numbers');
    }
  }

  function px_setWidthHeight([pxWidth, pxHeight]) {
    if (typeof pxWidth === 'number' && typeof pxHeight === 'number') {
      const cellSize = _gridInstance.px_getCellSize();
      const gridParams = _gridInstance.getGridParams();
      _onGridWidth = (pxWidth + gridParams.gap) / (cellSize[0] + gridParams.gap);
      _onGridHeight = (pxHeight + gridParams.gap) / (cellSize[1] + gridParams.gap);
    } else {
      console.error('Pane.px_setWidthHeight: width, height must be numbers');
    }
  }

  function px_move([pxMoveVectorx, pxMoveVectory]) {
    const [pxPositionx, pxPositiony] = px_getxy();
    px_setxy([
      pxPositionx + pxMoveVectorx,
      pxPositiony + pxMoveVectory,
    ]);
  }

  function grid_getxy() {
    return [_onGridx, _onGridy];
  }

  function grid_getWidthHeight() {
    return [_onGridWidth, _onGridHeight];
  }

  function grid_setxy([onGridx, onGridy]) {
    if (typeof onGridx === 'number' && typeof onGridy === 'number') {
      _onGridx = onGridx;
      _onGridy = onGridy;
    } else {
      console.error('Pane.grid_setxy: x, y must be numbers');
    }
  }

  function grid_setWidthHeight([gridWidth, gridHeight]) {
    if (typeof gridWidth === 'number' && typeof gridHeight === 'number') {
      _onGridWidth = gridWidth;
      _onGridHeight = gridHeight;
    } else {
      console.error('Pane.grid_setWidthHeight: width, height must be numbers');
    }
  }

  function grid_move([gridMoveVectorx, gridMoveVectory]) {
    grid_setxy([
      _onGridx + gridMoveVectorx,
      _onGridy + gridMoveVectory,
    ]);
  }

  return {
    getSymbol,
    belongsToGrid,
    fitToSlot,
    px_getxy,
    px_getWidthHeight,
    px_getBottomRightxy,
    px_setxy,
    px_setWidthHeight,
    px_move,
    grid_getxy,
    grid_getWidthHeight,
    grid_setxy,
    grid_setWidthHeight,
    grid_move,
  };
};
