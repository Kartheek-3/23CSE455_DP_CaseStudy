#ifndef ENTITY_MODAL_FACTORY_HPP
#define ENTITY_MODAL_FACTORY_HPP

#include <string>
#include <memory>

class EntityModalController {
protected:
    std::string entityId;
public:
    explicit EntityModalController(std::string entityId);
    virtual ~EntityModalController() = default;
    virtual std::string getDomain() const = 0;
    const std::string& getEntityId() const;
    virtual std::string renderAction() const = 0;
};

class LightModalController : public EntityModalController {
public:
    explicit LightModalController(std::string entityId);
    std::string getDomain() const override;
    std::string renderAction() const override;
};

class SwitchModalController : public EntityModalController {
public:
    explicit SwitchModalController(std::string entityId);
    std::string getDomain() const override;
    std::string renderAction() const override;
};

class SensorModalController : public EntityModalController {
public:
    explicit SensorModalController(std::string entityId);
    std::string getDomain() const override;
    std::string renderAction() const override;
};

class ClimateModalController : public EntityModalController {
public:
    explicit ClimateModalController(std::string entityId);
    std::string getDomain() const override;
    std::string renderAction() const override;
};

class GenericModalController : public EntityModalController {
private:
    std::string domain;
public:
    GenericModalController(std::string entityId, std::string domain);
    std::string getDomain() const override;
    std::string renderAction() const override;
};

class ModalFactory {
public:
    static std::string extractDomain(const std::string& entityId);
    std::unique_ptr<EntityModalController> createModal(const std::string& entityId) const;
};

#endif // ENTITY_MODAL_FACTORY_HPP
