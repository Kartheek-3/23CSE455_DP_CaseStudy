class Router {
  constructor(routes, loggedIn, notFoundComponent) {
    this.routes = routes;
    this.loggedIn = loggedIn;
    this.notFound = notFoundComponent;
    this.listeners = [];
    this.current = null;
  }

  onChange(listener) { this.listeners.push(listener); }

  resolve(fullPath) {
    const [beforeHash, hash = ''] = fullPath.split('#');
    const [path, query = ''] = beforeHash.split('?');
    const segments = path.split('/').filter(Boolean);
    for (const route of this.routes) {
      const pattern = route.path.split('/').filter(Boolean);
      if (pattern.length !== segments.length) continue;
      const params = {};
      const matches = pattern.every((p, i) => {
        if (p.startsWith(':')) { params[p.slice(1)] = segments[i]; return true; }
        return p === segments[i];
      });
      if (matches) return { route, component: route.component, params, query, hash, popup: false };
    }
    return { route: null, component: this.notFound, params: {}, query, hash, popup: false };
  }

  navigate(fullPath) {
    let res = this.resolve(fullPath);
    if (res.route && res.route.loginRequired && !this.loggedIn) {
      res = { ...res, component: this.notFound, popup: true };
    }
    this.current = res;
    if (res.route) for (const listener of [...this.listeners]) listener(res);
    return res;
  }
}

module.exports = { Router };
