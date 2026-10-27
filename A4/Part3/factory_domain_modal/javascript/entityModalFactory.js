export class EntityModalController {
  constructor(entityId) {
    this.entityId = entityId;
  }

  getDomain() {
    throw new Error('getDomain() must be implemented');
  }

  renderAction() {
    throw new Error('renderAction() must be implemented');
  }
}

export class LightModalController extends EntityModalController {
  getDomain() {
    return 'light';
  }

  renderAction() {
    return 'RENDER_LIGHT_CONTROLS';
  }
}

export class SwitchModalController extends EntityModalController {
  getDomain() {
    return 'switch';
  }

  renderAction() {
    return 'RENDER_SWITCH_TOGGLE';
  }
}

export class SensorModalController extends EntityModalController {
  getDomain() {
    return 'sensor';
  }

  renderAction() {
    return 'RENDER_SENSOR_GRAPH';
  }
}

export class ClimateModalController extends EntityModalController {
  getDomain() {
    return 'climate';
  }

  renderAction() {
    return 'RENDER_CLIMATE_HVAC';
  }
}

export class GenericModalController extends EntityModalController {
  constructor(entityId, domain) {
    super(entityId);
    this.domain = domain;
  }

  getDomain() {
    return this.domain;
  }

  renderAction() {
    return 'RENDER_GENERIC_ATTRIBUTES';
  }
}

export class ModalFactory {
  static extractDomain(entityId) {
    if (!entityId || !entityId.includes('.')) return 'unknown';
    return entityId.split('.')[0];
  }

  createModal(entityId) {
    const domain = ModalFactory.extractDomain(entityId);
    switch (domain) {
      case 'light': return new LightModalController(entityId);
      case 'switch': return new SwitchModalController(entityId);
      case 'sensor': return new SensorModalController(entityId);
      case 'climate': return new ClimateModalController(entityId);
      default: return new GenericModalController(entityId, domain);
    }
  }
}
