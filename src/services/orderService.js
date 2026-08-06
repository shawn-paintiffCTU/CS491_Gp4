import { supabase } from '../lib/supabase'

export async function createOrder({
  user,
  items,
  itemCount,
  subtotalCents,
  discountCents,
  taxCents,
  totalCents,
  promotionCode,
}) {
  if (!user) {
    return {
      error: new Error('User must be logged in.'),
    }
  }

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      item_count: itemCount,
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      tax_cents: taxCents,
      total_cents: totalCents,
      promotion_code: promotionCode ?? null,
    })
    .select()
    .single()

  if (orderError) {
    return { error: orderError }
  }

  // Create the order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    menu_item_id: String(item.menuItemId),
    item_name: item.name,
    quantity: item.quantity,
    unit_price_cents: item.unitPriceCents,
    size_name: item.size?.name ?? null,
    crust_name: item.crust?.name ?? null,
    toppings: item.toppings ?? [],
  }))

  const { error: itemError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemError) {
    return { error: itemError }
  }

  return {
    order,
    error: null,
  }
}