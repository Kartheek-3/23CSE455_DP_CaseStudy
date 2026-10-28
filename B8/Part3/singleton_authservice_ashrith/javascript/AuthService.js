class AuthService {
  static instance;
  constructor() { if (AuthService.instance) return AuthService.instance; AuthService.instance = this; }
}
module.exports = AuthService;
