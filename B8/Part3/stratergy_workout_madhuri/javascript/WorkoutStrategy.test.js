const assert=require('node:assert/strict');
const {WeightLoss,MuscleGain,WorkoutRecommender}=require('./WorkoutStrategy');
const r=new WorkoutRecommender(new WeightLoss()); assert(r.plan().includes('Cycling'));
r.setStrategy(new MuscleGain()); assert(r.plan().includes('Progressive overload'));
console.log('Workout Strategy tests passed');
