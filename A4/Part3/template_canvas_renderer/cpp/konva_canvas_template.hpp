#ifndef KONVA_CANVAS_TEMPLATE_HPP
#define KONVA_CANVAS_TEMPLATE_HPP

#include <string>
#include <vector>

class KonvaCanvasTemplate {
protected:
    int stageWidth = 0;
    int stageHeight = 0;
    double effectiveScale = 1.0;
    std::string backgroundImage;
    std::vector<std::string> renderedElements;
    std::string overlayType;
    bool snapshotRecorded = false;

    // Invariant steps
    virtual void initializeStage(int width, int height);
    virtual void calculateViewportScale(double zoom, double dpi);
    virtual void renderBackground(const std::string& bgUri);
    virtual void renderElements(const std::vector<std::string>& elements);

    // Primitive operation (overridden by subclasses)
    virtual void renderOverlay() = 0;

    // Hook operation (optional override)
    virtual void onRenderCompleteHook();

public:
    virtual ~KonvaCanvasTemplate() = default;

    // Template Method
    void renderCanvas(
        int width,
        int height,
        double zoom,
        double dpi,
        const std::string& bgUri,
        const std::vector<std::string>& elements
    );

    int getStageWidth() const;
    int getStageHeight() const;
    double getEffectiveScale() const;
    const std::string& getBackgroundImage() const;
    const std::vector<std::string>& getRenderedElements() const;
    const std::string& getOverlayType() const;
    bool isSnapshotRecorded() const;
};

class KonvaViewer : public KonvaCanvasTemplate {
protected:
    void renderOverlay() override;
};

class KonvaEditor : public KonvaCanvasTemplate {
protected:
    void renderOverlay() override;
    void onRenderCompleteHook() override;
};

#endif // KONVA_CANVAS_TEMPLATE_HPP
