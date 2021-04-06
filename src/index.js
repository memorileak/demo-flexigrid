import {flexiGrid, flexiPane} from '@tpacks/flexigrid';

function drawGrid(gridInstance, withPreview = false) {
  const gridHeight = gridInstance.getGridHeightByPixel();
  let $paneEls = [];
  for (const paneId of gridInstance.getPaneIds()) {
    const pane = gridInstance.getPane(paneId);
    const [x, y] = pane.getXYByPixel();
    const [width, height] = pane.getWidthHeightByPixel();
    const zIndex = pane.getZIndexLevel();
    const $paneEl = $('<div class="pane"><div class="resizer"></div></div>');
    $paneEl.data('pane-id', paneId);
    $paneEl.css('position', 'absolute');
    $paneEl.css('background-color', '#007ee6');
    $paneEl.css('left', `${x}px`);
    $paneEl.css('top', `${y}px`);
    $paneEl.css('width', `${width}px`);
    $paneEl.css('height', `${height}px`);
    $paneEl.css('z-index', `${zIndex}`);
    $paneEls.push($paneEl);
  }

  let $previewPaneEl = null;
  if (withPreview) {
    const previewPane = gridInstance.getPreviewPane();
    const [x, y] = previewPane.getXYByPixel();
    const [width, height] = previewPane.getWidthHeightByPixel();
    const zIndex = previewPane.getZIndexLevel();
    $previewPaneEl = $('<div class="preview-pane"></div>');
    $previewPaneEl.css('position', 'absolute');
    $previewPaneEl.css('left', `${x}px`);
    $previewPaneEl.css('top', `${y}px`);
    $previewPaneEl.css('width', `${width}px`);
    $previewPaneEl.css('height', `${height}px`);
    $previewPaneEl.css('z-index', `${zIndex}`);
    if (gridInstance.isHavingCollisionWithPreviewPane()) {
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

  const grid = flexiGrid({widthByPixel: $gridEl.innerWidth(), rowHeightByPixel: 60, gapByPixel: 10});
  window.grid = grid;

  grid.setPreviewPane(flexiPane({xByGridCell: 10, yByGridCell: 0, widthByGridCell: 1, heightByGridCell: 1}));

  grid.addPane(flexiPane({xByGridCell: 0, yByGridCell: 0, widthByGridCell: 5, heightByGridCell: 3}));
  grid.addPane(flexiPane({xByGridCell: 0, yByGridCell: 3, widthByGridCell: 5, heightByGridCell: 3}));
  grid.addPane(flexiPane({xByGridCell: 5, yByGridCell: 3, widthByGridCell: 6, heightByGridCell: 3}));
  grid.addPane(flexiPane({xByGridCell: 0, yByGridCell: 6, widthByGridCell: 16, heightByGridCell: 3}));

  drawGrid(grid);

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
        drawGrid(grid, true);
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
        drawGrid(grid);
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
        drawGrid(grid, true);
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
        drawGrid(grid);
      }
    })

  $(window).on('resize', () => {
    grid.setGridParameter({widthByPixel: $gridEl.innerWidth()});
    drawGrid(grid)
  });
});
