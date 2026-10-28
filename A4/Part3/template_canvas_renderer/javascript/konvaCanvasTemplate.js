export class KonvaCanvasTemplate {
  constructor() {
    this.stageWidth = 0;
    this.stageHeight = 0;
    this.effectiveScale = 1.0;
    this.backgroundImage = '';
    this.renderedElements = [];
    this.overlayType = '';
    this.snapshotRecorded = false;
  }

  // Template Method
  renderCanvas(width, height, zoom, dpi, bgUri, elements = []) {
    this.initializeStage(width, height);
    this.calculateViewportScale(zoom, dpi);
    this.renderBackground(bgUri);
    this.renderElements(elements);
    this.renderOverlay();
    this.onRenderCompleteHook();
  }

  // Invariant step 1
  initializeStage(width, height) {
    this.stageWidth = width;
    this.stageHeight = height;
  }

  // Invariant step 2
  calculateViewportScale(zoom, dpi) {
    this.effectiveScale = zoom * dpi;
  }

  // Invariant step 3
  renderBackground(bgUri) {
    this.backgroundImage = bgUri;
  }

  // Invariant step 4
  renderElements(elements) {
    this.renderedElements = Array.isArray(elements) ? [...elements] : [];
  }

  // Primitive operation (implemented by subclasses)
  renderOverlay() {
    throw new Error('renderOverlay() must be implemented');
  }

  // Hook operation (optional override)
  onRenderCompleteHook() {
    // default no-op
  }
}

export class KonvaViewer extends KonvaCanvasTemplate {
  renderOverlay() {
    this.overlayType = 'PASSIVE_TOOLTIPS';
  }
}

export class KonvaEditor extends KonvaCanvasTemplate {
  renderOverlay() {
    this.overlayType = 'INTERACTIVE_TRANSFORM_HANDLES';
  }

  onRenderCompleteHook() {
    this.snapshotRecorded = true;
  }
}
