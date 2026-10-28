from dataclasses import dataclass
from abc import ABC, abstractmethod
from typing import Optional, Sequence


@dataclass
class Trainer:
    name: str
    specialization: str
    current_clients: int
    max_clients: int
    rating: float
    active: bool = True


class TrainerAssignmentPolicy(ABC):
    """Strategy interface for choosing an eligible trainer."""

    @abstractmethod
    def select_trainer(self, trainers: Sequence[Trainer],
                       member_goal: str) -> Optional[Trainer]:
        raise NotImplementedError

    @staticmethod
    def eligible(trainers):
        return [t for t in trainers
                if t.active and t.current_clients < t.max_clients]


class SpecializationMatchPolicy(TrainerAssignmentPolicy):
    def select_trainer(self, trainers, member_goal):
        candidates = self.eligible(trainers)
        matching = [t for t in candidates
                    if t.specialization.casefold() == member_goal.casefold()]
        return max(matching, key=lambda t: t.rating, default=None)


class LeastLoadedPolicy(TrainerAssignmentPolicy):
    def select_trainer(self, trainers, member_goal):
        candidates = self.eligible(trainers)
        return min(candidates, key=lambda t: (t.current_clients, -t.rating),
                   default=None)


class HighestRatedPolicy(TrainerAssignmentPolicy):
    def select_trainer(self, trainers, member_goal):
        candidates = self.eligible(trainers)
        return max(candidates, key=lambda t: t.rating, default=None)


class TrainerAssignmentService:
    """Context: delegates trainer selection to the configured strategy."""

    def __init__(self, policy: TrainerAssignmentPolicy):
        self.policy = policy

    def set_policy(self, policy: TrainerAssignmentPolicy):
        self.policy = policy

    def assign(self, trainers, member_goal):
        return self.policy.select_trainer(trainers, member_goal)
