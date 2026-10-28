from abc import ABC, abstractmethod

NOOP = "noop"


class AnalyticsInstance(ABC):
    @abstractmethod
    def track(self, event): ...

    @abstractmethod
    def page(self, name): ...

    @abstractmethod
    def identify(self, user): ...


class RealAnalytics(AnalyticsInstance):
    def track(self, event):
        return "real:track " + event

    def page(self, name):
        return "real:page " + name

    def identify(self, user):
        return "real:identify " + user


class AnalyticsProxy(AnalyticsInstance):
    def __init__(self, analytics=None):
        self._analytics = analytics

    def set_analytics(self, analytics):
        if self._analytics is not None:
            raise RuntimeError("Analytics instance already exists.")
        self._analytics = analytics

    def track(self, event):
        return NOOP if self._analytics is None else self._analytics.track(event)

    def page(self, name):
        return NOOP if self._analytics is None else self._analytics.page(name)

    def identify(self, user):
        return NOOP if self._analytics is None else self._analytics.identify(user)
