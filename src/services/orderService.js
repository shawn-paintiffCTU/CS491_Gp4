import { supabase } from "../lib/supabase";

const ORDER_SELECT = `
  id,
  user_id,
  status,
  item_count,
  subtotal_cents,
  discount_cents,
  tax_cents,
  total_cents,
  promotion_code,
  fulfillment_method,
  customer_name,
  customer_phone,
  payment_brand,
  payment_last_four,
  created_at,
  order_items (
    id,
    item_name,
    quantity,
    unit_price_cents,
    size_name,
    crust_name,
    toppings
  )
`;

export async function createOrder({
  items,
  itemCount,
  subtotalCents,
  discountCents,
  taxCents,
  totalCents,
  promotionCode,
  customerName,
  phone,
  paymentMethod,
}) {
  const orderItems = items.map((item) => ({
    menu_item_id: String(item.menuItemId),
    item_name: item.name,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    size_name: item.size?.name ?? null,
    crust_name: item.crust?.name ?? null,
    toppings: item.toppings ?? [],
  }));

  const { data, error } = await supabase.rpc("place_order", {
    order_data: {
      item_count: itemCount,
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      promotion_code: promotionCode ?? null,
      customer_name: customerName.trim(),
      customer_phone: phone.trim(),
      payment_brand: paymentMethod.cardBrand,
      payment_last_four: paymentMethod.lastFour,
    },
    items_data: orderItems,
  });

  return {
    order: error ? null : { id: data },
    error,
  };
}

export async function getUserOrders(userId) {
  if (!userId) {
    return {
      orders: [],
      error: new Error("A user ID is required."),
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    orders: data ?? [],
    error,
  };
}

export async function getAllOrders() {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return {
      orders: [],
      error: ordersError,
    };
  }

  const userIds = [
    ...new Set(orders.map((order) => order.user_id).filter(Boolean)),
  ];

  if (userIds.length === 0) {
    return {
      orders,
      error: null,
    };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", userIds);

  if (profilesError) {
    return {
      orders: [],
      error: profilesError,
    };
  }

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  return {
    orders: orders.map((order) => ({
      ...order,
      customer: profileMap.get(order.user_id) ?? null,
    })),
    error: null,
  };
}

export async function updateOrderStatus(orderId, status) {
  const allowedStatuses = [
    "placed",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return {
      order: null,
      error: new Error("Invalid order status."),
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  return {
    order: data,
    error,
  };
}
