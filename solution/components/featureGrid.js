/**
 * Feature Grid Component
 * Renders feature cards in a responsive grid
 */

export function renderFeatureGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const features = [
    {
      title: "Personalized Nutrition",
      description: "Macro-optimized meal plans aligned with your metabolic profile and health conditions."
    },
    {
      title: "AI-Powered Coaching",
      description: "Daily nudges, habit tracking, and adaptive recommendations based on your progress."
    },
    {
      title: "Medical Oversight",
      description: "Structured monitoring with condition-specific protocols for safe, sustainable transformation."
    },
    {
      title: "Behavioral Accountability",
      description: "WhatsApp support, weekly check-ins, and structured milestones to prevent dropout."
    },
    {
      title: "Recovery Optimization",
      description: "Sleep, stress, and recovery protocols to enhance metabolic efficiency."
    },
    {
      title: "Long-term Sustainability",
      description: "Habit-based approach designed for permanent lifestyle transformation."
    }
  ];
  
  container.innerHTML = features.map(feature => `
    <div class="feature-card">
      <h3>${feature.title}</h3>
      <p>${feature.description}</p>
    </div>
  `).join('');
}
