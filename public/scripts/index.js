function drawGrid(gridInstance, withPreview = false) {
  const gridHeight = gridInstance.px_getGridHeight();
  $paneEls = [];
  for (const paneSymbol of gridInstance.getPaneSymbols()) {
    const pane = gridInstance.getPane(paneSymbol);
    const [x, y] = pane.px_getxy();
    const [width, height] = pane.px_getWidthHeight();
    const $paneEl = $('<div class="pane"><div class="resizer"></div></div>');
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
    $previewPaneEl.css('left', `${x}px`);
    $previewPaneEl.css('top', `${y}px`);
    $previewPaneEl.css('width', `${width}px`);
    $previewPaneEl.css('height', `${height}px`);
    if (gridInstance.hasPreviewCollision()) {
      $previewPaneEl.css('background-color', '#ff000040');
    } else {
      $previewPaneEl.css('background-color', '#007ee640');
    }
  }

  $('#flexigrid').css('height', `${gridHeight}px`);
  $('#flexigrid').empty();
  $('#flexigrid').append($previewPaneEl);
  $('#flexigrid').append($paneEls);
}

$(document).ready(function() {
  const $gridEl = $('#flexigrid');

  const grid = flexiGrid({width: $gridEl.innerWidth(), rowHeight: 60, gap: 10});
  window.grid = grid;

  grid.setPreviewPane(flexiPane({onGridx: 10, onGridy: 0, onGridWidth: 1, onGridHeight: 1}));

  grid.addPane(flexiPane({onGridx: 0, onGridy: 0, onGridWidth: 5, onGridHeight: 3}));
  grid.addPane(flexiPane({onGridx: 0, onGridy: 3, onGridWidth: 5, onGridHeight: 3}));
  grid.addPane(flexiPane({onGridx: 5, onGridy: 3, onGridWidth: 6, onGridHeight: 3}));
  grid.addPane(flexiPane({onGridx: 0, onGridy: 6, onGridWidth: 16, onGridHeight: 3}));

  drawGrid(grid);

  let dragMode = false;
  let paneOnDrag = null;
  let pxOffsetToTopLeftVector = null;
  let originalGridPosition = null;
  $gridEl
    .on('mousedown', '.pane', function(e) {
      dragMode = true;
      paneOnDrag = grid.getPane($(this).data('pane-symbol'));
      grid.attachPreview(paneOnDrag);
      const {top: gridTop, left: gridLeft} = $gridEl.offset();
      const {pageX, pageY} = e;
      const pxPickPoint = [pageX - gridLeft, pageY - gridTop];
      const pxTopLeft = paneOnDrag.px_getxy();
      pxOffsetToTopLeftVector = grid.px_calVector(pxPickPoint, pxTopLeft);
      originalGridPosition = paneOnDrag.grid_getxy();
    })
    .on('mousemove', function(e) {
      if (dragMode) {
        const previewPane = grid.getPreviewPane();
        const {top: gridTop, left: gridLeft} = $gridEl.offset();
        const {pageX, pageY} = e;
        const pxPickPoint = [pageX - gridLeft, pageY - gridTop];
        previewPane.grid_positioning(pxPickPoint, pxOffsetToTopLeftVector);
        previewPane.fitToSlot();
        paneOnDrag.px_positioning(pxPickPoint, pxOffsetToTopLeftVector);
        drawGrid(grid, true);
      }
    })
    .on('mouseup', function() {
      if (dragMode) {
        if (grid.hasPreviewCollision()) {
          paneOnDrag.grid_setxy(originalGridPosition);
        } else {
          const previewPane = grid.getPreviewPane();
          paneOnDrag.grid_setxy(previewPane.grid_getxy());
        }
        paneOnDrag.fitToSlot();
        grid.detachPreview();
        dragMode = false;
        paneOnDrag = null;
        pxOffsetPositioningVector = null;
        drawGrid(grid);
      }
    });

  let resizeMode = false;
  let paneOnResize = null;
  let pxOffsetToBottomRightVector = null;
  let originalGridSize = null;
  $gridEl
    .on('mousedown', '.resizer', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const $paneEl = $(this).parent('.pane');
      resizeMode = true;
      paneOnResize = grid.getPane($paneEl.data('pane-symbol'));
      grid.attachPreview(paneOnResize);
      const {top: gridTop, left: gridLeft} = $gridEl.offset();
      const {pageX, pageY} = e;
      const pxPickPoint = [pageX - gridLeft, pageY - gridTop];
      const pxBottomRight = paneOnResize.px_getBottomRightxy();
      pxOffsetToBottomRightVector = grid.px_calVector(pxPickPoint, pxBottomRight);
      originalGridSize = paneOnResize.grid_getWidthHeight();
    })
    .on('mousemove', function(e) {
      if (resizeMode) {
        const previewPane = grid.getPreviewPane();
        const {top: gridTop, left: gridLeft} = $gridEl.offset();
        const {pageX, pageY} = e;
        const pxPickPoint = [pageX - gridLeft, pageY - gridTop];
        previewPane.grid_sizing(pxPickPoint, pxOffsetToBottomRightVector);
        previewPane.fitToSlot();
        paneOnResize.px_sizing(pxPickPoint, pxOffsetToBottomRightVector);
        drawGrid(grid, true);
      }
    })
    .on('mouseup', function() {
      if (resizeMode) {
        if (grid.hasPreviewCollision()) {
          paneOnResize.grid_setWidthHeight(originalGridSize);
        } else {
          const previewPane = grid.getPreviewPane();
          paneOnResize.grid_setWidthHeight(previewPane.grid_getWidthHeight());
        }
        paneOnResize.fitToSlot();
        grid.detachPreview();
        resizeMode = false;
        paneOnResize = null;
        pxOffsetToBottomRightVector = null;
        drawGrid(grid);
      }
    })

  $(window).on('resize', () => {
    grid.setGridParams({width: $gridEl.innerWidth()});
    drawGrid(grid)
  });
});
