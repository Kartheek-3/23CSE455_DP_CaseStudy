class PlansService {
  static instance;
  constructor() { if (PlansService.instance) return PlansService.instance; PlansService.instance = this; }
}
module.exports = PlansService;
