/**
 * Testimonial Block Component
 * Renders social proof testimonials
 */

export function renderTestimonialBlock(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const testimonials = [
    {
      quote: "The structured approach helped me reverse my metabolic strain. Lost 12kg in 3 months with sustainable habits.",
      author: "Priya S., 34",
      outcome: "12kg loss • Metabolic score: 45 → 78"
    },
    {
      quote: "Medical oversight gave me confidence. My thyroid levels stabilized while losing weight safely.",
      author: "Rajesh K., 42",
      outcome: "8kg loss • TSH normalized • Energy restored"
    },
    {
      quote: "The behavioral accountability prevented my usual dropout. This time I completed the full program.",
      author: "Anita M., 29",
      outcome: "15kg loss • Consistency: 95% adherence"
    }
  ];
  
  container.innerHTML = testimonials.map(testimonial => `
    <div class="testimonial-card">
      <div class="quote">"${testimonial.quote}"</div>
      <div class="author">— ${testimonial.author}</div>
      <div class="outcome">${testimonial.outcome}</div>
    </div>
  `).join('');
}
