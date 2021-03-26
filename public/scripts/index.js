function drawGrid(gridInstance) {
  const gridHeight = gridInstance.px_getGridHeight();
  $paneEls = [];
  for (const paneSymbol of gridInstance.getPaneSymbols()) {
    const pane = gridInstance.getPane(paneSymbol);
    const [x, y] = pane.px_getxy(gridInstance);
    const [width, height] = pane.px_getWidthHeight(gridInstance);
    const $paneEl = $('<div class="pane"></div>');
    $paneEl.data('pane-symbol', paneSymbol);
    $paneEl.css('position', 'absolute');
    $paneEl.css('background-color', 'green');
    $paneEl.css('border', '1px solid white');
    $paneEl.css('left', `${x}px`);
    $paneEl.css('top', `${y}px`);
    $paneEl.css('width', `${width}px`);
    $paneEl.css('height', `${height}px`);
    $paneEls.push($paneEl);
  }
  $('#flexigrid').css('height', `${gridHeight}px`);
  $('#flexigrid').empty();
  $('#flexigrid').append($paneEls);
}

$(document).ready(function() {
  const $gridEl = $('#flexigrid');

  const grid = flexiGrid({width: $gridEl.innerWidth(), gap: 10});
  window.grid = grid;

  window.pane1 = grid.addPane(flexiPane({onGridx: 0, onGridy: 0, widthByCells: 5, heightByCells: 3}));
  window.pane2 = grid.addPane(flexiPane({onGridx: 5, onGridy: 0, widthByCells: 5, heightByCells: 3}));
  window.pane3 = grid.addPane(flexiPane({onGridx: 0, onGridy: 3, widthByCells: 16, heightByCells: 3}));
  window.pane4 = grid.addPane(flexiPane({onGridx: 0, onGridy: 6, widthByCells: 6, heightByCells: 3}));

  drawGrid(grid);

  let dragMode = false;
  let paneOnDrag = null;
  let dragFrom = null;
  $gridEl
    .on('mousedown', '.pane', function(e) {
      dragMode = true;
      paneOnDrag = grid.getPane($(this).data('pane-symbol'));
      const {top: gridTop, left: gridLeft} = $gridEl.offset();
      const {pageX, pageY} = e;
      dragFrom = [pageX - gridLeft, pageY - gridTop];
    })
    .on('mousemove', function(e) {
      if (dragMode) {
        const {top: gridTop, left: gridLeft} = $gridEl.offset();
        const {pageX, pageY} = e;
        const dragTo = [pageX - gridLeft, pageY - gridTop];
        paneOnDrag.grid_move(grid.grid_calVector(dragFrom, dragTo));
        dragFrom = dragTo;
        drawGrid(grid);
      }
    })
    .on('mouseup', function() {
      if (dragMode) {
        dragMode = false;
        paneOnDrag = null;
        dragFrom = null;
      }
    });

  $(window).on('resize', () => {
    grid.setGridParams({width: $gridEl.innerWidth()});
    drawGrid(grid)
  });
});
