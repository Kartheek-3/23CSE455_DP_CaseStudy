class WeightLoss:
    def recommend(self): return ["Walking","Cycling"]
class MuscleGain:
    def recommend(self): return ["Resistance training","Progressive overload"]
class GeneralFitness:
    def recommend(self): return ["Walking","Mobility"]
class WorkoutRecommender:
    def __init__(self,strategy): self.strategy=strategy
    def set_strategy(self,strategy): self.strategy=strategy
    def plan(self): return self.strategy.recommend()
