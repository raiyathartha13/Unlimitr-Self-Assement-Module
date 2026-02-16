/**
 * Trajectory Chart Component
 * Renders dual-path trajectory simulation (with/without intervention)
 */

export function renderTrajectoryChart(intelligence, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  canvas.width = width;
  canvas.height = height;
  
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw axes
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // Draw labels
  ctx.fillStyle = "#6B7280";
  ctx.font = "12px Inter";
  ctx.fillText("Weeks", width / 2 - 30, height - 10);
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Health Score", 0, 0);
  ctx.restore();
  
  // Draw without intervention path (red dashed)
  ctx.strokeStyle = "#D93025";
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  const currentScore = intelligence.totalScore;
  const weeks = intelligence.correctionWindowWeeks || 12;
  
  for (let i = 0; i <= weeks; i++) {
    const x = padding + (i / weeks) * chartWidth;
    const decline = currentScore - (i * 2); // Decline over time
    const y = height - padding - (decline / 100) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  
  // Draw with intervention path (green smooth)
  ctx.strokeStyle = "#0F9D58";
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.beginPath();
  
  for (let i = 0; i <= weeks; i++) {
    const x = padding + (i / weeks) * chartWidth;
    const improvement = currentScore + (i * (75 - currentScore) / weeks);
    const oscillation = Math.sin(i * 0.5) * 2; // Micro oscillation
    const y = height - padding - ((improvement + oscillation) / 100) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  
  // Draw markers
  ctx.fillStyle = "#0F9D58";
  ctx.beginPath();
  ctx.arc(padding + chartWidth, padding + (0.25 * chartHeight), 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#D93025";
  ctx.beginPath();
  ctx.arc(padding + chartWidth, padding + (0.75 * chartHeight), 6, 0, Math.PI * 2);
  ctx.fill();
}
