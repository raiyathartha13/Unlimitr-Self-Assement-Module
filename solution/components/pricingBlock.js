/**
 * Pricing Block Component
 * Renders pricing information with dynamic calculation
 */

export function renderPricingBlock(plan, containerId) {
  const dailyCostEl = document.getElementById("dailyCost");
  const finalPriceEl = document.getElementById("finalPrice");
  
  if (dailyCostEl) {
    dailyCostEl.textContent = plan.dailyPrice;
  }
  
  if (finalPriceEl) {
    finalPriceEl.textContent = "₹ " + plan.price.toLocaleString("en-IN");
    const strikeEl = finalPriceEl.previousElementSibling;
    if (strikeEl && strikeEl.classList.contains("strike")) {
      strikeEl.textContent = "₹ " + plan.originalPrice.toLocaleString("en-IN");
    }
  }
}

export function updatePricing(duration, basePrice) {
  const price = basePrice;
  const dailyPrice = Math.round(price / (duration * 30));
  const originalPrice = Math.round(price * 1.5);
  
  const dailyCostEl = document.getElementById("dailyCost");
  const finalPriceEl = document.getElementById("finalPrice");
  
  if (dailyCostEl) dailyCostEl.textContent = dailyPrice;
  if (finalPriceEl) {
    finalPriceEl.textContent = "₹ " + price.toLocaleString("en-IN");
    const strikeEl = finalPriceEl.previousElementSibling;
    if (strikeEl && strikeEl.classList.contains("strike")) {
      strikeEl.textContent = "₹ " + originalPrice.toLocaleString("en-IN");
    }
  }
  
  return { price, dailyPrice, originalPrice };
}
