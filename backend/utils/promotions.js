"use strict";

function derivePromotionBonus(promotion, spent) {
  let bonus = 0;
  if (typeof promotion.points === "number") {
    bonus += promotion.points;
  }
  if (typeof promotion.rate === "number") {
    bonus += Math.round(spent * promotion.rate);
  }
  return bonus;
}

module.exports = {
  derivePromotionBonus,
};
