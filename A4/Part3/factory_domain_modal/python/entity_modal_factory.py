from abc import ABC, abstractmethod


class EntityModalController(ABC):
    def __init__(self, entity_id: str):
        self.entity_id = entity_id

    @abstractmethod
    def get_domain(self) -> str:
        pass

    @abstractmethod
    def render_action(self) -> str:
        pass


class LightModalController(EntityModalController):
    def get_domain(self) -> str:
        return "light"

    def render_action(self) -> str:
        return "RENDER_LIGHT_CONTROLS"


class SwitchModalController(EntityModalController):
    def get_domain(self) -> str:
        return "switch"

    def render_action(self) -> str:
        return "RENDER_SWITCH_TOGGLE"


class SensorModalController(EntityModalController):
    def get_domain(self) -> str:
        return "sensor"

    def render_action(self) -> str:
        return "RENDER_SENSOR_GRAPH"


class ClimateModalController(EntityModalController):
    def get_domain(self) -> str:
        return "climate"

    def render_action(self) -> str:
        return "RENDER_CLIMATE_HVAC"


class GenericModalController(EntityModalController):
    def __init__(self, entity_id: str, domain: str):
        super().__init__(entity_id)
        self.domain = domain

    def get_domain(self) -> str:
        return self.domain

    def render_action(self) -> str:
        return "RENDER_GENERIC_ATTRIBUTES"


class ModalFactory:
    @staticmethod
    def extract_domain(entity_id: str) -> str:
        if not entity_id or "." not in entity_id:
            return "unknown"
        return entity_id.split(".", 1)[0]

    def create_modal(self, entity_id: str) -> EntityModalController:
        domain = self.extract_domain(entity_id)
        if domain == "light":
            return LightModalController(entity_id)
        elif domain == "switch":
            return SwitchModalController(entity_id)
        elif domain == "sensor":
            return SensorModalController(entity_id)
        elif domain == "climate":
            return ClimateModalController(entity_id)
        return GenericModalController(entity_id, domain)
