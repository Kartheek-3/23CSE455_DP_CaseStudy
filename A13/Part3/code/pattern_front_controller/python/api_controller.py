from collections import namedtuple

Endpoint = namedtuple("Endpoint", "name require_credential execute")
Response = namedtuple("Response", "status text")


class ApiController:
    def __init__(self, authenticate, limit=2):
        self._authenticate = authenticate
        self._limit = limit
        self._endpoints = {}
        self._calls = {}

    def register(self, endpoint):
        self._endpoints[endpoint.name] = endpoint

    def handle(self, name, token, body):
        endpoint = self._endpoints.get(name)
        if endpoint is None:
            return Response(404, "no such endpoint")
        user = self._authenticate(token)
        if endpoint.require_credential and user is None:
            return Response(401, "credential required")
        actor = user or "anon"
        calls = self._calls.get(actor, 0)
        if calls >= self._limit:
            return Response(429, "rate limited")
        self._calls[actor] = calls + 1
        return Response(200, endpoint.execute(body, user))
