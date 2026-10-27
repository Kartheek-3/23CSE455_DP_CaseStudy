from collections import namedtuple

Route = namedtuple("Route", "path component login_required")
Resolved = namedtuple("Resolved", "route component params query hash popup")


class Router:
    def __init__(self, routes, logged_in, not_found_component):
        self._routes = routes
        self._logged_in = logged_in
        self._not_found = not_found_component
        self._listeners = []
        self.current = None

    def on_change(self, listener):
        self._listeners.append(listener)

    def resolve(self, full_path):
        path, _, hash_ = full_path.partition("#")
        path, _, query = path.partition("?")
        segments = [s for s in path.split("/") if s]
        for route in self._routes:
            pattern = [s for s in route.path.split("/") if s]
            if len(pattern) != len(segments):
                continue
            params = {}
            for p, s in zip(pattern, segments):
                if p.startswith(":"):
                    params[p[1:]] = s
                elif p != s:
                    break
            else:
                return Resolved(route, route.component, params, query, hash_, False)
        return Resolved(None, self._not_found, {}, query, hash_, False)

    def navigate(self, full_path):
        res = self.resolve(full_path)
        if res.route is not None and res.route.login_required and not self._logged_in:
            res = res._replace(component=self._not_found, popup=True)
        self.current = res
        if res.route is not None:
            for listener in list(self._listeners):
                listener(res)
        return res
