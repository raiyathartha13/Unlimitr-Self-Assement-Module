# UNLIMITR AI Cognitive Backbone — Production Brain Layer

## Structure

```
core/
  ai-knowledge-base.json   # Structured JSON schema (direct import ready)
  HealthEngine.js          # Class-based scoring engine
  narrativeEngine.js       # Lightweight scoring + behavior classification

ml/
  training-data.json       # ML-ready dataset (TensorFlow.js compatible)
```

## Architecture

```
assessment.js → collects user input
       ↓
HealthEngine.js → scoring (5 dimensions, risk zones, plan logic)
       ↓
behaviorClassifier.js → psychological type (A–E)
       ↓
narrativeEngine.js → dynamic writing
       ↓
dashboardRenderer.js → animated UI
```

## Optional ML Layer

```js
if (mlModelLoaded) {
  refineScore = mlModel.predict(userTensor);
  finalScore = (0.7 * ruleScore) + (0.3 * mlScore);
}
```

## Numerical Encoding (training-data.json)

- **sleep**: 1 = poor, 2 = moderate, 3 = good  
- **stress**: 1 = low, 2 = moderate, 3 = high  
- **activity**: 1 = sedentary, 2 = moderate, 3 = high  

## Usage

```js
var engine = new HealthEngine(userData);
var scores = computeAllScores(userData);
var healthScore = engine.calculateHealthScore(scores);
var zone = engine.getRiskZone(healthScore);
var plan = engine.recommendPlan(healthScore);
var narrative = engine.generateNarrative(healthScore, engine.getConditionMessage());
```
