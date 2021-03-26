function flexiPane({onGridx, onGridy, widthByCells, heightByCells}) {
  let _onGridx = typeof onGridx === 'number' ? onGridx : 0;
  let _onGridy = typeof onGridy === 'number' ? onGridy : 0;
  let _widthByCells = typeof widthByCells === 'number' ? widthByCells : 2;
  let _heightByCells = typeof heightByCells === 'number' ? heightByCells : 2;

  function px_getxy(gridInstance) {
    const cellSize = gridInstance.px_getCellSize();
    const gridParams = gridInstance.getGridParams();
    const x = _onGridx * (cellSize[0] + gridParams.gap);
    const y = _onGridy * (cellSize[1] + gridParams.gap);
    return [x, y];
  }

  function px_getWidthHeight(gridInstance) {
    const cellSize = gridInstance.px_getCellSize();
    const gridParams = gridInstance.getGridParams();
    const width = _widthByCells * cellSize[0] + (_widthByCells - 1) * gridParams.gap;
    const height = _heightByCells * cellSize[1] + (_heightByCells - 1) * gridParams.gap;
    return [width, height];
  }

  function px_getBottomRightxy(gridInstance) {
    const cellSize = gridInstance.px_getCellSize();
    const gridParams = gridInstance.getGridParams();
    const topLeftx = _onGridx * (cellSize[0] + gridParams.gap);
    const topLefty = _onGridy * (cellSize[1] + gridParams.gap);
    const width = _widthByCells * cellSize[0] + (_widthByCells - 1) * gridParams.gap;
    const height = _heightByCells * cellSize[1] + (_heightByCells - 1) * gridParams.gap;
    return [topLeftx + width, topLefty + height];
  }

  function grid_getxy() {
    return [_onGridx, _onGridy];
  }

  function grid_getWidthHeight() {
    return [_widthByCells, _heightByCells];
  }

  function grid_setxy([onGridx, onGridy]) {
    if (typeof onGridx === 'number' && typeof onGridy === 'number') {
      _onGridx = onGridx;
      _onGridy = onGridy;
    } else {
      console.error('Pane.grid_setxy: x, y must be numbers');
    }
  }

  function grid_move([gridMoveVectorx, gridMoveVectory]) {
    grid_setxy([
      _onGridx + gridMoveVectorx,
      _onGridy + gridMoveVectory,
    ]);
  }

  function grid_getxyOfPoint(gridInstance, [pxx, pxy]) {
    const cellSize = gridInstance.px_getCellSize();
    const gridParams = gridInstance.getGridParams();
    const gridx = Math.floor(pxx / (cellSize[0] + gridParams.gap));
    const gridy = Math.floor(pxy / (cellSize[1] + gridParams.gap));
    return [gridx, gridy];
  }

  function grid_calMoveVector(gridInstance, [pxFromx, pxFromy], [pxTox, pxToy]) {
    const [gridFromx, gridFromy] = grid_getxyOfPoint(gridInstance, [pxFromx, pxFromy]);
    const [gridTox, gridToy] = grid_getxyOfPoint(gridInstance, [pxTox, pxToy]);
    return [gridTox - gridFromx, gridToy - gridFromy];
  }

  return {
    px_getxy,
    px_getWidthHeight,
    px_getBottomRightxy,
    grid_getxy,
    grid_getWidthHeight,
    grid_move,
    grid_calMoveVector,
  };
};
