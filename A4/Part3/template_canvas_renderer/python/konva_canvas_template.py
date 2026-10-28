from abc import ABC, abstractmethod
from typing import List, Optional


class KonvaCanvasTemplate(ABC):
    def __init__(self):
        self.stage_width: int = 0
        self.stage_height: int = 0
        self.effective_scale: float = 1.0
        self.background_image: str = ""
        self.rendered_elements: List[str] = []
        self.overlay_type: str = ""
        self.snapshot_recorded: bool = False

    # Template Method
    def render_canvas(
        self,
        width: int,
        height: int,
        zoom: float,
        dpi: float,
        bg_uri: str,
        elements: Optional[List[str]],
    ) -> None:
        self.initialize_stage(width, height)
        self.calculate_viewport_scale(zoom, dpi)
        self.render_background(bg_uri)
        self.render_elements(elements)
        self.render_overlay()
        self.on_render_complete_hook()

    # Invariant step 1
    def initialize_stage(self, width: int, height: int) -> None:
        self.stage_width = width
        self.stage_height = height

    # Invariant step 2
    def calculate_viewport_scale(self, zoom: float, dpi: float) -> None:
        self.effective_scale = zoom * dpi

    # Invariant step 3
    def render_background(self, bg_uri: str) -> None:
        self.background_image = bg_uri

    # Invariant step 4
    def render_elements(self, elements: Optional[List[str]]) -> None:
        self.rendered_elements = list(elements) if elements else []

    # Primitive operation (implemented by subclasses)
    @abstractmethod
    def render_overlay(self) -> None:
        pass

    # Hook operation (optional override)
    def on_render_complete_hook(self) -> None:
        pass


class KonvaViewer(KonvaCanvasTemplate):
    def render_overlay(self) -> None:
        self.overlay_type = "PASSIVE_TOOLTIPS"


class KonvaEditor(KonvaCanvasTemplate):
    def render_overlay(self) -> None:
        self.overlay_type = "INTERACTIVE_TRANSFORM_HANDLES"

    def on_render_complete_hook(self) -> None:
        self.snapshot_recorded = True
