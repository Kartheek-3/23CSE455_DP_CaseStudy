#include <cassert>
#include <iostream>
#include <memory>
#include <string>
#include <vector>
struct WorkoutPlanStrategy { virtual ~WorkoutPlanStrategy()=default; virtual std::vector<std::string> recommend() const=0; };
struct WeightLoss:WorkoutPlanStrategy { std::vector<std::string> recommend() const override{return {"Walking","Cycling"};} };
struct MuscleGain:WorkoutPlanStrategy { std::vector<std::string> recommend() const override{return {"Resistance training","Progressive overload"};} };
struct GeneralFitness:WorkoutPlanStrategy { std::vector<std::string> recommend() const override{return {"Walking","Mobility"};} };
struct WorkoutRecommender { std::unique_ptr<WorkoutPlanStrategy> s; explicit WorkoutRecommender(std::unique_ptr<WorkoutPlanStrategy> x):s(std::move(x)){} void setStrategy(std::unique_ptr<WorkoutPlanStrategy>x){s=std::move(x);} std::vector<std::string> plan()const{return s->recommend();} };
int main(){WorkoutRecommender r(std::make_unique<WeightLoss>()); assert(r.plan()[1]=="Cycling"); r.setStrategy(std::make_unique<MuscleGain>()); assert(r.plan()[1]=="Progressive overload"); std::cout<<"Workout Strategy tests passed\\n";}
