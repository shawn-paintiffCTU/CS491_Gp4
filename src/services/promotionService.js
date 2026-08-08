import { supabase } from "../lib/supabase";
import { formatCurrency } from "../utils/pricing";

function mapPromotion(record) {
  return {
    id: record.id,
    code: record.code,
    description: record.description,
    discountType: record.discount_type,
    discountValue: record.discount_value,
    minimumSubtotalCents: record.minimum_subtotal_cents,
    isActive: record.is_active,
    displayOrder: record.display_order,
  };
}

const PROMOTION_COLUMNS = `
  id,
  code,
  description,
  discount_type,
  discount_value,
  minimum_subtotal_cents,
  is_active,
  display_order
`;

export async function getActivePromotions() {
  const { data, error } = await supabase
    .from("promotions")
    .select(PROMOTION_COLUMNS)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("code", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPromotion);
}

export async function getAllPromotions() {
  const { data, error } = await supabase
    .from("promotions")
    .select(PROMOTION_COLUMNS)
    .order("display_order", { ascending: true })
    .order("code", { ascending: true });

  return {
    promotions: (data ?? []).map(mapPromotion),
    error,
  };
}

export async function validatePromotionCode(code, subtotalCents) {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      isValid: false,
      message: "Enter a promotion code.",
    };
  }

  const { data, error } = await supabase
    .from("promotions")
    .select(PROMOTION_COLUMNS)
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return {
      isValid: false,
      message: "The promotion code could not be checked.",
    };
  }

  if (!data) {
    return {
      isValid: false,
      message: "That promotion code is not valid.",
    };
  }

  const promotion = mapPromotion(data);

  if (subtotalCents < promotion.minimumSubtotalCents) {
    return {
      isValid: false,
      message: `This promotion requires a minimum subtotal of ${formatCurrency(
        promotion.minimumSubtotalCents,
      )}.`,
    };
  }

  return {
    isValid: true,
    promotion,
    message: `${promotion.code} was applied successfully.`,
  };
}

export function calculatePromotionDiscount(promotion, subtotalCents) {
  if (!promotion || subtotalCents < promotion.minimumSubtotalCents) {
    return 0;
  }

  if (promotion.discountType === "percentage") {
    return Math.round(subtotalCents * (promotion.discountValue / 100));
  }

  if (promotion.discountType === "fixed") {
    return Math.min(promotion.discountValue, subtotalCents);
  }

  return 0;
}

export async function createPromotion(promotion) {
  const { data, error } = await supabase
    .from("promotions")
    .insert({
      code: promotion.code.trim().toUpperCase(),
      description: promotion.description.trim(),
      discount_type: promotion.discountType,
      discount_value: promotion.discountValue,
      minimum_subtotal_cents: promotion.minimumSubtotalCents,
      is_active: promotion.isActive,
      display_order: promotion.displayOrder,
    })
    .select(PROMOTION_COLUMNS)
    .single();

  return {
    promotion: data ? mapPromotion(data) : null,
    error,
  };
}

export async function updatePromotion(promotionId, changes) {
  const update = {};

  if (typeof changes.code === "string") {
    update.code = changes.code.trim().toUpperCase();
  }

  if (typeof changes.description === "string") {
    update.description = changes.description.trim();
  }

  if (typeof changes.discountType === "string") {
    update.discount_type = changes.discountType;
  }

  if (Number.isInteger(changes.discountValue)) {
    update.discount_value = changes.discountValue;
  }

  if (Number.isInteger(changes.minimumSubtotalCents)) {
    update.minimum_subtotal_cents = changes.minimumSubtotalCents;
  }

  if (typeof changes.isActive === "boolean") {
    update.is_active = changes.isActive;
  }

  if (Number.isInteger(changes.displayOrder)) {
    update.display_order = changes.displayOrder;
  }

  const { data, error } = await supabase
    .from("promotions")
    .update(update)
    .eq("id", promotionId)
    .select(PROMOTION_COLUMNS)
    .single();

  return {
    promotion: data ? mapPromotion(data) : null,
    error,
  };
}

export async function deletePromotion(promotionId) {
  const { error } = await supabase
    .from("promotions")
    .delete()
    .eq("id", promotionId);

  return { error };
}
