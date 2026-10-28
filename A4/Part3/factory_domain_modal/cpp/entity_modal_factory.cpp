#include "entity_modal_factory.hpp"

EntityModalController::EntityModalController(std::string entityId)
    : entityId(std::move(entityId)) {}

const std::string& EntityModalController::getEntityId() const {
    return entityId;
}

LightModalController::LightModalController(std::string entityId)
    : EntityModalController(std::move(entityId)) {}

std::string LightModalController::getDomain() const { return "light"; }
std::string LightModalController::renderAction() const { return "RENDER_LIGHT_CONTROLS"; }

SwitchModalController::SwitchModalController(std::string entityId)
    : EntityModalController(std::move(entityId)) {}

std::string SwitchModalController::getDomain() const { return "switch"; }
std::string SwitchModalController::renderAction() const { return "RENDER_SWITCH_TOGGLE"; }

SensorModalController::SensorModalController(std::string entityId)
    : EntityModalController(std::move(entityId)) {}

std::string SensorModalController::getDomain() const { return "sensor"; }
std::string SensorModalController::renderAction() const { return "RENDER_SENSOR_GRAPH"; }

ClimateModalController::ClimateModalController(std::string entityId)
    : EntityModalController(std::move(entityId)) {}

std::string ClimateModalController::getDomain() const { return "climate"; }
std::string ClimateModalController::renderAction() const { return "RENDER_CLIMATE_HVAC"; }

GenericModalController::GenericModalController(std::string entityId, std::string domain)
    : EntityModalController(std::move(entityId)), domain(std::move(domain)) {}

std::string GenericModalController::getDomain() const { return domain; }
std::string GenericModalController::renderAction() const { return "RENDER_GENERIC_ATTRIBUTES"; }

std::string ModalFactory::extractDomain(const std::string& entityId) {
    auto dot = entityId.find('.');
    if (dot == std::string::npos) return "unknown";
    return entityId.substr(0, dot);
}

std::unique_ptr<EntityModalController> ModalFactory::createModal(const std::string& entityId) const {
    std::string domain = extractDomain(entityId);
    if (domain == "light") return std::unique_ptr<EntityModalController>(new LightModalController(entityId));
    if (domain == "switch") return std::unique_ptr<EntityModalController>(new SwitchModalController(entityId));
    if (domain == "sensor") return std::unique_ptr<EntityModalController>(new SensorModalController(entityId));
    if (domain == "climate") return std::unique_ptr<EntityModalController>(new ClimateModalController(entityId));
    return std::unique_ptr<EntityModalController>(new GenericModalController(entityId, domain));
}
