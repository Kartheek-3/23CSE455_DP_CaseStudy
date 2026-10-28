package templatemethod;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class KonvaCanvasTemplate {
    protected int stageWidth;
    protected int stageHeight;
    protected double effectiveScale;
    protected String backgroundImage;
    protected final List<String> renderedElements = new ArrayList<>();
    protected String overlayType;
    protected boolean snapshotRecorded = false;

    // Template Method
    public final void renderCanvas(int width, int height, double zoom, double dpi, String bgUri, List<String> elements) {
        initializeStage(width, height);
        calculateViewportScale(zoom, dpi);
        renderBackground(bgUri);
        renderElements(elements);
        renderOverlay();
        onRenderCompleteHook();
    }

    // Invariant step 1
    protected void initializeStage(int width, int height) {
        this.stageWidth = width;
        this.stageHeight = height;
    }

    // Invariant step 2
    protected void calculateViewportScale(double zoom, double dpi) {
        this.effectiveScale = zoom * dpi;
    }

    // Invariant step 3
    protected void renderBackground(String bgUri) {
        this.backgroundImage = bgUri;
    }

    // Invariant step 4
    protected void renderElements(List<String> elements) {
        renderedElements.clear();
        if (elements != null) {
            renderedElements.addAll(elements);
        }
    }

    // Primitive operation (customized by subclasses)
    protected abstract void renderOverlay();

    // Hook operation (optional override)
    protected void onRenderCompleteHook() {
        // default no-op
    }

    public int getStageWidth() { return stageWidth; }
    public int getStageHeight() { return stageHeight; }
    public double getEffectiveScale() { return effectiveScale; }
    public String getBackgroundImage() { return backgroundImage; }
    public List<String> getRenderedElements() { return Collections.unmodifiableList(renderedElements); }
    public String getOverlayType() { return overlayType; }
    public boolean isSnapshotRecorded() { return snapshotRecorded; }

    public static class KonvaViewer extends KonvaCanvasTemplate {
        @Override
        protected void renderOverlay() {
            this.overlayType = "PASSIVE_TOOLTIPS";
        }
    }

    public static class KonvaEditor extends KonvaCanvasTemplate {
        @Override
        protected void renderOverlay() {
            this.overlayType = "INTERACTIVE_TRANSFORM_HANDLES";
        }

        @Override
        protected void onRenderCompleteHook() {
            this.snapshotRecorded = true;
        }
    }
}
