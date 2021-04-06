import {flexiGrid, flexiPane} from '@tpacks/flexigrid';

function drawGridWithoutPreviewPane(gridInstance) {
  const panes = getPanesFromGridInstance(gridInstance);
  setHeightForGridByHeightOfGridInstance(gridInstance);
  clearCurrentGrid();
  renderToGridJqueryPanes(makeJqueryPanesFromPanes(panes));
}

function drawGridWithPreviewPane(gridInstance) {
  if (gridInstance.isHavingCollisionWithPreviewPane()) {
    drawGridWithCollidedPreviewPane(gridInstance);
  } else {
    drawGridWithNotCollidedPreviewPane(gridInstance);
  }
}

function drawGridWithNotCollidedPreviewPane(gridInstance) {
  const panes = getPanesFromGridInstance(gridInstance);
  const previewPane = gridInstance.getPreviewPane();
  setHeightForGridByHeightOfGridInstance(gridInstance);
  clearCurrentGrid();
  renderToGridJqueryPanes(makeJqueryPanesFromPanes(panes));
  renderToGridJqueryPreviewPane(makeNotCollidedJqueryPreviewPaneFromPane(previewPane));
}

function drawGridWithCollidedPreviewPane(gridInstance) {
  const panes = getPanesFromGridInstance(gridInstance);
  const previewPane = gridInstance.getPreviewPane();
  setHeightForGridByHeightOfGridInstance(gridInstance);
  clearCurrentGrid();
  renderToGridJqueryPanes(makeJqueryPanesFromPanes(panes));
  renderToGridJqueryPreviewPane(makeCollidedJqueryPreviewPaneFromPane(previewPane));
}

function getPanesFromGridInstance(gridInstance) {
  return gridInstance.getPaneIds().map((paneId) => gridInstance.getPane(paneId));
}

function setHeightForGridByHeightOfGridInstance(gridInstance) {
  const gridHeight = gridInstance.getGridHeightByPixel();
  $('#flexigrid').css('height', `${gridHeight}px`);
}

function clearCurrentGrid() {
  $('#flexigrid').empty();
}

function renderToGridJqueryPanes($panes) {
  $('#flexigrid').append($panes);
}

function renderToGridJqueryPreviewPane($previewPane) {
  $('#flexigrid').append($previewPane);
}

function makeJqueryPanesFromPanes(panes) {
  const $panes = [];
  for (let i = 0; i < panes.length; i += 1) {
    const pane = panes[i];
    const [x, y] = pane.getXYByPixel();
    const [width, height] = pane.getWidthHeightByPixel();
    const zIndex = pane.getZIndexLevel();
    const $pane = $('<div class="pane"><div class="resizer"></div></div>');
    $pane.data('pane-id', pane.getId());
    $pane.css('position', 'absolute');
    $pane.css('background-color', '#007ee6');
    $pane.css('left', `${x}px`);
    $pane.css('top', `${y}px`);
    $pane.css('width', `${width}px`);
    $pane.css('height', `${height}px`);
    $pane.css('z-index', `${zIndex}`);
    $panes.push($pane);
  }
  return $panes;
}

function makeNotCollidedJqueryPreviewPaneFromPane(previewPane) {
  const [x, y] = previewPane.getXYByPixel();
  const [width, height] = previewPane.getWidthHeightByPixel();
  const zIndex = previewPane.getZIndexLevel();
  const $previewPane = $('<div class="preview-pane"></div>');
  $previewPane.css('position', 'absolute');
  $previewPane.css('left', `${x}px`);
  $previewPane.css('top', `${y}px`);
  $previewPane.css('width', `${width}px`);
  $previewPane.css('height', `${height}px`);
  $previewPane.css('z-index', `${zIndex}`);
  $previewPane.css('background-color', '#007ee640');
  return $previewPane;
}

function makeCollidedJqueryPreviewPaneFromPane(previewPane) {
  const $previewPane = makeNotCollidedJqueryPreviewPaneFromPane(previewPane);
  $previewPane.css('background-color', '#ff000040');
  return $previewPane;
}

$(document).ready(function() {
  const $gridEl = $('#flexigrid');

  const grid = flexiGrid({widthByPixel: $gridEl.innerWidth(), rowHeightByPixel: 60, gapByPixel: 10});
  window.grid = grid;

  grid.setPreviewPane(flexiPane({xByGridCell: 10, yByGridCell: 0, widthByGridCell: 1, heightByGridCell: 1}));

  grid.addPane(flexiPane({xByGridCell: 0, yByGridCell: 0, widthByGridCell: 5, heightByGridCell: 3}));
  grid.addPane(flexiPane({xByGridCell: 0, yByGridCell: 3, widthByGridCell: 5, heightByGridCell: 3}));
  grid.addPane(flexiPane({xByGridCell: 5, yByGridCell: 3, widthByGridCell: 6, heightByGridCell: 3}));
  grid.addPane(flexiPane({xByGridCell: 0, yByGridCell: 6, widthByGridCell: 16, heightByGridCell: 3}));

  drawGridWithoutPreviewPane(grid);

  let dragMode = false;
  let paneOnDrag = null;
  let offsetToTopLeftVectorByPixel = null;
  let originalPositionByGridCell = null;
  $gridEl
    .on('mousedown', '.pane', function(e) {
      dragMode = true;
      paneOnDrag = grid.getPane($(this).data('pane-id'));
      grid.attachPreview(paneOnDrag);
      const {top: gridTopLeftXByPixel, left: gridTopLeftYByPixel} = $gridEl.offset();
      const {pageX, pageY} = e;
      const pickPointByPixel = [pageX - gridTopLeftYByPixel, pageY - gridTopLeftXByPixel];
      const paneTopLeftByPixel = paneOnDrag.getXYByPixel();
      offsetToTopLeftVectorByPixel = grid.calculateVectorByPixelFromPixels(pickPointByPixel, paneTopLeftByPixel);
      originalPositionByGridCell = paneOnDrag.getXYByGridCell();
    })
    .on('mousemove', function(e) {
      if (dragMode) {
        const previewPane = grid.getPreviewPane();
        const {top: gridTopLeftXByPixel, left: gridTopLeftYByPixel} = $gridEl.offset();
        const {pageX, pageY} = e;
        const pickPointByPixel = [pageX - gridTopLeftYByPixel, pageY - gridTopLeftXByPixel];
        previewPane.positioningByGridCellWithPixels(pickPointByPixel, offsetToTopLeftVectorByPixel);
        previewPane.fitToSlot();
        paneOnDrag.positioningByPixelWithPixels(pickPointByPixel, offsetToTopLeftVectorByPixel);
        drawGridWithPreviewPane(grid);
      }
    })
    .on('mouseup', function() {
      if (dragMode) {
        if (grid.isHavingCollisionWithPreviewPane()) {
          paneOnDrag.setXYByGridCell(originalPositionByGridCell);
        } else {
          const previewPane = grid.getPreviewPane();
          paneOnDrag.setXYByGridCell(previewPane.getXYByGridCell());
        }
        paneOnDrag.fitToSlot();
        grid.detachPreview();
        dragMode = false;
        paneOnDrag = null;
        offsetToTopLeftVectorByPixel = null;
        drawGridWithoutPreviewPane(grid);
      }
    });

  let resizeMode = false;
  let paneOnResize = null;
  let offsetToBottomRightVectorByPixel = null;
  let originalSizeByGridCell = null;
  $gridEl
    .on('mousedown', '.resizer', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const $paneEl = $(this).parent('.pane');
      resizeMode = true;
      paneOnResize = grid.getPane($paneEl.data('pane-id'));
      grid.attachPreview(paneOnResize);
      const {top: gridTopLeftXByPixel, left: gridTopLeftYByPixel} = $gridEl.offset();
      const {pageX, pageY} = e;
      const pickPointByPixel = [pageX - gridTopLeftYByPixel, pageY - gridTopLeftXByPixel];
      const paneBottomRightByPixel = paneOnResize.getBottomRightXYByPixel();
      offsetToBottomRightVectorByPixel = grid.calculateVectorByPixelFromPixels(pickPointByPixel, paneBottomRightByPixel);
      originalSizeByGridCell = paneOnResize.getWidthHeightByGridCell();
    })
    .on('mousemove', function(e) {
      if (resizeMode) {
        const previewPane = grid.getPreviewPane();
        const {top: gridTopLeftXByPixel, left: gridTopLeftYByPixel} = $gridEl.offset();
        const {pageX, pageY} = e;
        const pickPointByPixel = [pageX - gridTopLeftYByPixel, pageY - gridTopLeftXByPixel];
        previewPane.sizingByGridCellWithPixels(pickPointByPixel, offsetToBottomRightVectorByPixel);
        previewPane.fitToSlot();
        paneOnResize.sizingByPixelWithPixels(pickPointByPixel, offsetToBottomRightVectorByPixel);
        drawGridWithPreviewPane(grid);
      }
    })
    .on('mouseup', function() {
      if (resizeMode) {
        if (grid.isHavingCollisionWithPreviewPane()) {
          paneOnResize.setWidthHeightByGridCell(originalSizeByGridCell);
        } else {
          const previewPane = grid.getPreviewPane();
          paneOnResize.setWidthHeightByGridCell(previewPane.getWidthHeightByGridCell());
        }
        paneOnResize.fitToSlot();
        grid.detachPreview();
        resizeMode = false;
        paneOnResize = null;
        offsetToBottomRightVectorByPixel = null;
        drawGridWithoutPreviewPane(grid);
      }
    })

  $(window).on('resize', () => {
    grid.setGridParameter({widthByPixel: $gridEl.innerWidth()});
    drawGridWithoutPreviewPane(grid);
  });
});
