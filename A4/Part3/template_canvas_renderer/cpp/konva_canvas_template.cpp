#include "konva_canvas_template.hpp"

void KonvaCanvasTemplate::initializeStage(int width, int height) {
    this->stageWidth = width;
    this->stageHeight = height;
}

void KonvaCanvasTemplate::calculateViewportScale(double zoom, double dpi) {
    this->effectiveScale = zoom * dpi;
}

void KonvaCanvasTemplate::renderBackground(const std::string& bgUri) {
    this->backgroundImage = bgUri;
}

void KonvaCanvasTemplate::renderElements(const std::vector<std::string>& elements) {
    this->renderedElements = elements;
}

void KonvaCanvasTemplate::onRenderCompleteHook() {
    // default no-op
}

void KonvaCanvasTemplate::renderCanvas(
    int width,
    int height,
    double zoom,
    double dpi,
    const std::string& bgUri,
    const std::vector<std::string>& elements
) {
    initializeStage(width, height);
    calculateViewportScale(zoom, dpi);
    renderBackground(bgUri);
    renderElements(elements);
    renderOverlay();
    onRenderCompleteHook();
}

int KonvaCanvasTemplate::getStageWidth() const { return stageWidth; }
int KonvaCanvasTemplate::getStageHeight() const { return stageHeight; }
double KonvaCanvasTemplate::getEffectiveScale() const { return effectiveScale; }
const std::string& KonvaCanvasTemplate::getBackgroundImage() const { return backgroundImage; }
const std::vector<std::string>& KonvaCanvasTemplate::getRenderedElements() const { return renderedElements; }
const std::string& KonvaCanvasTemplate::getOverlayType() const { return overlayType; }
bool KonvaCanvasTemplate::isSnapshotRecorded() const { return snapshotRecorded; }

void KonvaViewer::renderOverlay() {
    this->overlayType = "PASSIVE_TOOLTIPS";
}

void KonvaEditor::renderOverlay() {
    this->overlayType = "INTERACTIVE_TRANSFORM_HANDLES";
}

void KonvaEditor::onRenderCompleteHook() {
    this->snapshotRecorded = true;
}
