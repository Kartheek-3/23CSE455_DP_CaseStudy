from workout_strategy import *
r=WorkoutRecommender(WeightLoss()); assert "Cycling" in r.plan()
r.set_strategy(MuscleGain()); assert "Progressive overload" in r.plan()
print("Workout Strategy tests passed")
