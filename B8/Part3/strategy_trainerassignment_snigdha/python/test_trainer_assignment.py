import unittest
from trainer_assignment import (
    Trainer, TrainerAssignmentService, SpecializationMatchPolicy,
    LeastLoadedPolicy, HighestRatedPolicy
)


class TrainerAssignmentTests(unittest.TestCase):
    def setUp(self):
        self.trainers = [
            Trainer("Asha", "Weight Loss", 3, 10, 4.8),
            Trainer("Ravi", "Muscle Gain", 1, 10, 4.5),
            Trainer("Maya", "Weight Loss", 5, 10, 4.9),
            Trainer("John", "General Fitness", 0, 10, 5.0, active=False),
        ]

    def test_specialization_match(self):
        service = TrainerAssignmentService(SpecializationMatchPolicy())
        self.assertEqual(service.assign(self.trainers, "Weight Loss").name, "Maya")

    def test_least_loaded(self):
        service = TrainerAssignmentService(LeastLoadedPolicy())
        self.assertEqual(service.assign(self.trainers, "Any Goal").name, "Ravi")

    def test_highest_rated(self):
        service = TrainerAssignmentService(HighestRatedPolicy())
        self.assertEqual(service.assign(self.trainers, "Any Goal").name, "Maya")

    def test_no_eligible_trainer(self):
        full = [Trainer("Full", "Any", 2, 2, 5.0)]
        self.assertIsNone(TrainerAssignmentService(HighestRatedPolicy()).assign(full, "Any"))

    def test_switch_strategy(self):
        service = TrainerAssignmentService(LeastLoadedPolicy())
        service.set_policy(HighestRatedPolicy())
        self.assertEqual(service.assign(self.trainers, "Any").name, "Maya")


if __name__ == "__main__":
    unittest.main()
