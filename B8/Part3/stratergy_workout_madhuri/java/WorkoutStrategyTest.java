public class WorkoutStrategyTest {
 public static void main(String[] args){
  WorkoutRecommender r=new WorkoutRecommender(new WeightLoss());
  if(!r.plan().contains("Cycling")) throw new AssertionError();
  r.setStrategy(new MuscleGain());
  if(!r.plan().contains("Progressive overload")) throw new AssertionError();
  System.out.println("Workout Strategy tests passed");
 }
}
