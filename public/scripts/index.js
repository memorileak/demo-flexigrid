function drawGrid(gridInstance, withPreview = false) {
  const gridHeight = gridInstance.px_getGridHeight();
  $paneEls = [];
  for (const paneSymbol of gridInstance.getPaneSymbols()) {
    const pane = gridInstance.getPane(paneSymbol);
    const [x, y] = pane.px_getxy();
    const [width, height] = pane.px_getWidthHeight();
    const $paneEl = $('<div class="pane"></div>');
    $paneEl.data('pane-symbol', paneSymbol);
    $paneEl.css('position', 'absolute');
    $paneEl.css('background-color', '#007ee6');
    // $paneEl.css('border', '1px solid white');
    $paneEl.css('left', `${x}px`);
    $paneEl.css('top', `${y}px`);
    $paneEl.css('width', `${width}px`);
    $paneEl.css('height', `${height}px`);
    $paneEls.push($paneEl);
  }

  let $previewPaneEl = null;
  if (withPreview) {
    const previewPane = gridInstance.getPreviewPane();
    const [x, y] = previewPane.px_getxy();
    const [width, height] = previewPane.px_getWidthHeight();
    $previewPaneEl = $('<div class="preview-pane"></div>');
    $previewPaneEl.css('position', 'absolute');
    $previewPaneEl.css('background-color', '#007ee640');
    $previewPaneEl.css('left', `${x}px`);
    $previewPaneEl.css('top', `${y}px`);
    $previewPaneEl.css('width', `${width}px`);
    $previewPaneEl.css('height', `${height}px`);
  }

  $('#flexigrid').css('height', `${gridHeight}px`);
  $('#flexigrid').empty();
  $('#flexigrid').append($previewPaneEl);
  $('#flexigrid').append($paneEls);
}

$(document).ready(function() {
  const $gridEl = $('#flexigrid');

  const grid = flexiGrid({width: $gridEl.innerWidth(), gap: 10});
  window.grid = grid;

  grid.setPreviewPane(flexiPane({onGridx: 10, onGridy: 0, onGridWidth: 1, onGridHeight: 1}));

  grid.addPane(flexiPane({onGridx: 0, onGridy: 0, onGridWidth: 5, onGridHeight: 3}));
  grid.addPane(flexiPane({onGridx: 0, onGridy: 3, onGridWidth: 5, onGridHeight: 3}));
  grid.addPane(flexiPane({onGridx: 5, onGridy: 3, onGridWidth: 6, onGridHeight: 3}));
  grid.addPane(flexiPane({onGridx: 0, onGridy: 6, onGridWidth: 16, onGridHeight: 3}));

  drawGrid(grid);

  let dragMode = false;
  let paneOnDrag = null;
  let dragFrom = null;
  $gridEl
    .on('mousedown', '.pane', function(e) {
      dragMode = true;
      paneOnDrag = grid.getPane($(this).data('pane-symbol'));
      grid.previewForPane(paneOnDrag);
      const {top: gridTop, left: gridLeft} = $gridEl.offset();
      const {pageX, pageY} = e;
      dragFrom = [pageX - gridLeft, pageY - gridTop];
    })
    .on('mousemove', function(e) {
      if (dragMode) {
        const previewPane = grid.getPreviewPane();
        const {top: gridTop, left: gridLeft} = $gridEl.offset();
        const {pageX, pageY} = e;
        const dragTo = [pageX - gridLeft, pageY - gridTop];
        previewPane.grid_move(grid.grid_calVector(dragFrom, dragTo));
        paneOnDrag.px_move(grid.px_calVector(dragFrom, dragTo));
        dragFrom = dragTo;
        drawGrid(grid, true);
      }
    })
    .on('mouseup', function() {
      if (dragMode) {
        const previewPane = grid.getPreviewPane();
        paneOnDrag.grid_setxy(previewPane.grid_getxy());
        dragMode = false;
        paneOnDrag = null;
        dragFrom = null;
        drawGrid(grid);
      }
    });

  $(window).on('resize', () => {
    grid.setGridParams({width: $gridEl.innerWidth()});
    drawGrid(grid)
  });
});
