/**
 * Plan Card Component
 * Renders recommended plan card with dynamic data
 */

export function renderPlanCard(plan, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="recommended-plan">
      <h3>${plan.name}</h3>
      <p>${plan.objective}</p>
      <ul>
        <li>${plan.dietSessions} Dietitian Sessions</li>
        <li>${plan.fitnessSessions} Fitness/Yoga Sessions</li>
        <li>AI Health App Access</li>
        <li>24/7 Support</li>
        ${plan.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
      </ul>
    </div>
  `;
}
