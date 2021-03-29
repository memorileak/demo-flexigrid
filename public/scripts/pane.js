function flexiPane({onGridx, onGridy, onGridWidth, onGridHeight}) {
  let _onGridx = typeof onGridx === 'number' ? onGridx : 0;
  let _onGridy = typeof onGridy === 'number' ? onGridy : 0;
  let _onGridWidth = _validGridWidth(typeof onGridWidth === 'number' ? onGridWidth : 2);
  let _onGridHeight = _validGridHeight(typeof onGridHeight === 'number' ? onGridHeight : 2);
  let _gridInstance = null;
  let _ownSymbol = null;

  function _intCloseToZero(number) {
    if (number >= 0) {
      return Math.floor(number);
    } else {
      return -Math.floor(-number);
    }
  }

  function _validGridWidth(gridWidth) {
    return (gridWidth < 1) ? 1 : gridWidth;
  }

  function _validGridHeight(gridHeight) {
    return (gridHeight < 1) ? 1 : gridHeight;
  }

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
    _onGridWidth = _validGridWidth(Math.round(_onGridWidth));
    _onGridHeight = _validGridHeight(Math.round(_onGridHeight));
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
      _onGridWidth = _validGridWidth((pxWidth + gridParams.gap) / (cellSize[0] + gridParams.gap));
      _onGridHeight = _validGridHeight((pxHeight + gridParams.gap) / (cellSize[1] + gridParams.gap));
    } else {
      console.error('Pane.px_setWidthHeight: width, height must be numbers');
    }
  }

  function px_positioning([pxPickPointx, pxPickPointy], [pxOffsetToTopLeftx, pxOffsetToTopLefty]) {
    px_setxy([
      pxPickPointx + pxOffsetToTopLeftx,
      pxPickPointy + pxOffsetToTopLefty,
    ]);
  }

  function px_sizing([pxPickPointx, pxPickPointy], [pxOffsetToBottomRightx, pxOffsetToBottomRighty]) {
    const [pxTopLeftx, pxTopLefty] = px_getxy();
    const [pxBottomRightx, pxBottomRighty] = [
      pxPickPointx + pxOffsetToBottomRightx,
      pxPickPointy + pxOffsetToBottomRighty,
    ];
    px_setWidthHeight([
      pxBottomRightx - pxTopLeftx + 1,
      pxBottomRighty - pxTopLefty + 1,
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
      _onGridWidth = _validGridWidth(gridWidth);
      _onGridHeight = _validGridHeight(gridHeight);
    } else {
      console.error('Pane.grid_setWidthHeight: width, height must be numbers');
    }
  }

  function grid_positioning([pxPickPointx, pxPickPointy], [pxOffsetToTopLeftx, pxOffsetToTopLefty]) {
    const cellSize = _gridInstance.px_getCellSize();
    const gridParams = _gridInstance.getGridParams();
    const [gridPickPointx, gridPickPointy] = _gridInstance.grid_getxyOfPoint([pxPickPointx, pxPickPointy]);
    const [gridOffsetToTopLeftx, gridOffsetToTopLefty] = [
      _intCloseToZero(pxOffsetToTopLeftx / (cellSize[0] + gridParams.gap)),
      _intCloseToZero(pxOffsetToTopLefty / (cellSize[1] + gridParams.gap)),
    ];
    grid_setxy([
      gridPickPointx + gridOffsetToTopLeftx,
      gridPickPointy + gridOffsetToTopLefty,
    ]);
  }

  function grid_sizing([pxPickPointx, pxPickPointy], [pxOffsetToBottomRightx, pxOffsetToBottomRighty]) {
    const cellSize = _gridInstance.px_getCellSize();
    const gridParams = _gridInstance.getGridParams();
    const [gridPickPointx, gridPickPointy] = _gridInstance.grid_getxyOfPoint([pxPickPointx, pxPickPointy]);
    const [gridOffsetToBottomRightx, gridOffsetToBottomRighty] = [
      _intCloseToZero(pxOffsetToBottomRightx / (cellSize[0] + gridParams.gap)),
      _intCloseToZero(pxOffsetToBottomRighty / (cellSize[1] + gridParams.gap)),
    ];
    const [gridTopLeftx, gridTopLefty] = grid_getxy();
    const [gridBottomRightx, gridBottomRighty] = [
      gridPickPointx + gridOffsetToBottomRightx,
      gridPickPointy + gridOffsetToBottomRighty,
    ];
    grid_setWidthHeight([
      gridBottomRightx - gridTopLeftx + 1,
      gridBottomRighty - gridTopLefty + 1,
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
    px_positioning,
    px_sizing,
    grid_getxy,
    grid_getWidthHeight,
    grid_setxy,
    grid_setWidthHeight,
    grid_positioning,
    grid_sizing,
  };
};
