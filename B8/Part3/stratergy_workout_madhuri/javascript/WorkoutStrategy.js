class WeightLoss { recommend(){return ['Walking','Cycling'];} }
class MuscleGain { recommend(){return ['Resistance training','Progressive overload'];} }
class GeneralFitness { recommend(){return ['Walking','Mobility'];} }
class WorkoutRecommender {
 constructor(strategy){this.strategy=strategy;}
 setStrategy(strategy){this.strategy=strategy;}
 plan(){return this.strategy.recommend();}
}
module.exports={WeightLoss,MuscleGain,GeneralFitness,WorkoutRecommender};
