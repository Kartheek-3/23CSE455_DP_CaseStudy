import java.util.*;
interface WorkoutPlanStrategy { List<String> recommend(); }
class WeightLoss implements WorkoutPlanStrategy { public List<String> recommend(){return Arrays.asList("Walking","Cycling");} }
class MuscleGain implements WorkoutPlanStrategy { public List<String> recommend(){return Arrays.asList("Resistance training","Progressive overload");} }
class GeneralFitness implements WorkoutPlanStrategy { public List<String> recommend(){return Arrays.asList("Walking","Mobility");} }
class WorkoutRecommender {
 private WorkoutPlanStrategy strategy;
 WorkoutRecommender(WorkoutPlanStrategy s){strategy=s;}
 void setStrategy(WorkoutPlanStrategy s){strategy=s;}
 List<String> plan(){return strategy.recommend();}
}
