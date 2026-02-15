/**
 * ML Engine — TensorFlow.js
 * Score smoothing, risk clustering, pattern detection, non-linear projection
 */
(function (global) {
  "use strict";
  var model = null;
  var trained = false;
  var trainingPromise = null;

  function normalizeBMI(bmi) {
    return Math.max(0, Math.min(1, (bmi - 18) / 22));
  }
  function normalizeGap(gap) {
    return Math.max(0, Math.min(1, gap / 25));
  }
  function norm(v) {
    return Math.max(0, Math.min(1, (v || 0) / 100));
  }

  function buildModel() {
    if (typeof tf === "undefined") return null;
    var m = tf.sequential();
    m.add(tf.layers.dense({ units: 16, activation: "relu", inputShape: [8] }));
    m.add(tf.layers.dense({ units: 8, activation: "relu" }));
    m.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
    m.compile({ optimizer: "adam", loss: "meanSquaredError" });
    return m;
  }

  function generateSyntheticData(count) {
    var xs = [], ys = [];
    for (var i = 0; i < count; i++) {
      var bmi = 18 + Math.random() * 18;
      var stress = Math.random() * 100, sleep = 40 + Math.random() * 60;
      var activity = 40 + Math.random() * 60, medical = Math.random() * 50;
      var weightGap = Math.random() * 20, commitment = 30 + Math.random() * 70;
      var metabolicGap = (Math.random() - 0.5) * 20;
      var bioScore = 100 - Math.abs(bmi - 22) * 3 - (100 - sleep) * 0.1 - (100 - stress) * 0.1 + activity * 0.2 - medical * 0.2;
      bioScore = Math.max(20, Math.min(95, bioScore));
      var consistency = 100 - Math.min(80, (100 - sleep) * 0.2 + (100 - stress) * 0.2);
      var target = (bioScore * 0.6 + consistency * 0.3) / 100;
      target = Math.max(0.2, Math.min(0.95, target + (Math.random() - 0.5) * 0.05));
      xs.push([normalizeBMI(bmi), Math.max(0, Math.min(1, (metabolicGap + 10) / 20)), norm(100 - stress), norm(sleep), norm(activity), norm(medical), normalizeGap(weightGap), norm(commitment)]);
      ys.push([target]);
    }
    return { xs: xs, ys: ys };
  }

  function trainModel() {
    if (trainingPromise) return trainingPromise;
    if (typeof tf === "undefined") { trainingPromise = Promise.resolve(false); return trainingPromise; }
    trainingPromise = (async function () {
      try {
        model = buildModel();
        if (!model) return false;
        var synth = generateSyntheticData(150);
        var xTensor = tf.tensor2d(synth.xs);
        var yTensor = tf.tensor2d(synth.ys);
        await model.fit(xTensor, yTensor, { epochs: 25, batchSize: 32, verbose: 0 });
        xTensor.dispose(); yTensor.dispose();
        trained = true;
        return true;
      } catch (e) { trained = false; return false; }
    })();
    return trainingPromise;
  }

  function pseudoMLScore(inputVector) {
    var w = [0.15, 0.05, 0.2, 0.2, 0.15, 0.1, 0.05, 0.1], sum = 0;
    for (var i = 0; i < 8; i++) sum += (inputVector[i] || 0) * w[i];
    return 1 / (1 + Math.exp(-4 * (sum - 0.5)));
  }

  async function getMLScoreAsync(inputVector) {
    if (typeof tf === "undefined") return pseudoMLScore(inputVector) * 100;
    if (!trained && !model) { try { await trainModel(); } catch (e) {} }
    if (!trained || !model) return pseudoMLScore(inputVector) * 100;
    try {
      var input = tf.tensor2d([inputVector]);
      var pred = model.predict(input);
      var score = (await pred.data())[0];
      input.dispose(); pred.dispose();
      return Math.max(0, Math.min(100, score * 100));
    } catch (e) { return pseudoMLScore(inputVector) * 100; }
  }

  function getMLScore(inputVector, callback) {
    if (callback && typeof callback === "function") { getMLScoreAsync(inputVector).then(callback); return; }
    return pseudoMLScore(inputVector) * 100;
  }

  if (typeof window !== "undefined") {
    window.loadMLModel = trainModel;
    window.getMLScore = getMLScore;
    window.getMLScoreAsync = getMLScoreAsync;
    window.MLEngine = { load: trainModel, getScore: getMLScore, getScoreAsync: getMLScoreAsync };
  }
})(typeof window !== "undefined" ? window : this);
