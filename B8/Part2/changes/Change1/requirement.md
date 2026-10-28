# Change1: Personalized workout plans

## Requirement
Trainers can create workout plans tailored to a member's fitness goal. The system suggests
exercises for the chosen goal and difficulty, and can infer the goal from the member's profile.

## What was implemented
- **Backend**
  - `services/workout_recommendation.py` (new): one recommendation strategy per goal
    (General Fitness, Weight Loss, Muscle Building, Strength Training, Endurance, Flexibility),
    a factory that picks the strategy, and `infer_goal_from_text` for the member's free-text goals.
  - `GET /api/plans/workout/goals` lists the supported goals.
  - `GET /api/plans/workout/recommendations?goal=&difficulty=&member_id=&use_member_goal=`
    returns suggested exercises; difficulty adjusts the number of sets (Beginner -1, Advanced +1).
    Trainer or admin only.
  - `WorkoutPlan.fitness_goal` column; plans store and return their goal.
- **Frontend**
  - Plans page: goal selector loaded from the API, "Suggested exercises" panel that refreshes when
    the goal, difficulty or member changes, pre-fills the selected member's goal, and adds
    suggestions to the plan; plan cards show their goal tag.
  - `PlansService.getWorkoutGoals()` and `getWorkoutRecommendations()`; `WorkoutRecommendation` model.
- **Environment setup** (needed to run the project, included in this diff):
  `bcrypt==4.0.1` pinned for passlib, `.venv/` git-ignored, Angular CLI analytics disabled.

## Design pattern
- **Strategy**: `WorkoutRecommendationStrategy` with one concrete strategy per goal. The route
  (context) calls `strategy.recommend(difficulty)` without knowing which goal it is.
- **Simple Factory**: `WorkoutRecommendationFactory.get_strategy(goal)` maps a goal name to its
  strategy and falls back to General Fitness.
- Why: adding a goal means adding one strategy class and registering it, without editing the
  route or the frontend.

## Acceptance criteria
1. The factory offers 6 goals and every product is a `WorkoutRecommendationStrategy`.
2. An unknown goal falls back to General Fitness.
3. A member's free-text goal ("Lose 10kg...") is inferred as Weight Loss and used when requested.
4. Advanced recommendations have more sets than Beginner ones.
5. Members cannot request recommendations (403).
6. A saved workout plan keeps its `fitness_goal`.

## Files
- `change1.diff`: unified diff from the original code (`data/code/Gym-Managment-System`).
- `test_result.txt`: test output.
