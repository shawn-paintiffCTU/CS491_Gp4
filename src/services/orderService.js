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
  fulfillmentMethod,
  streetAddress,
  city,
  state,
  zipCode,
}) {
  if (!user) {
    return {
      error: new Error('User must be logged in.'),
    }
  }

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
      fulfillment_method: fulfillmentMethod,
      delivery_street:
        fulfillmentMethod === 'delivery'
          ? streetAddress.trim()
          : null,
      delivery_city:
        fulfillmentMethod === 'delivery'
          ? city.trim()
          : null,
      delivery_state:
        fulfillmentMethod === 'delivery'
          ? state.trim().toUpperCase()
          : null,
      delivery_zip:
        fulfillmentMethod === 'delivery'
          ? zipCode.trim()
          : null,
    })
    .select()
    .single()

  if (orderError) {
    return {
      order: null,
      error: orderError,
    }
  }

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
    return {
      order,
      error: itemError,
    }
  }

  return {
    order,
    error: null,
  }
}

export async function getUserOrders(userId) {
  if (!userId) {
    return {
      orders: [],
      error: new Error('A user ID is required.'),
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      item_count,
      subtotal_cents,
      discount_cents,
      tax_cents,
      total_cents,
      promotion_code,
      fulfillment_method,
      delivery_street,
      delivery_city,
      delivery_state,
      delivery_zip,
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
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return {
    orders: data ?? [],
    error,
  }
}

export async function getAllOrders() {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
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
      delivery_street,
      delivery_city,
      delivery_state,
      delivery_zip,
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
    `)
    .order('created_at', { ascending: false })

  if (ordersError) {
    return {
      orders: [],
      error: ordersError,
    }
  }

  const userIds = [
    ...new Set(
      orders
        .map((order) => order.user_id)
        .filter(Boolean),
    ),
  ]

  if (userIds.length === 0) {
    return {
      orders,
      error: null,
    }
  }

  const { data: profiles, error: profilesError } =
    await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .in('id', userIds)

  if (profilesError) {
    return {
      orders: [],
      error: profilesError,
    }
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  )

  const ordersWithCustomers = orders.map((order) => ({
    ...order,
    customer:
      profileMap.get(order.user_id) ?? null,
  }))

  return {
    orders: ordersWithCustomers,
    error: null,
  }
}

export async function updateOrderStatus(
  orderId,
  status,
) {
  const allowedStatuses = [
    'placed',
    'preparing',
    'ready',
    'completed',
    'cancelled',
  ]

  if (!allowedStatuses.includes(status)) {
    return {
      order: null,
      error: new Error('Invalid order status.'),
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
    })
    .eq('id', orderId)
    .select()
    .single()

  return {
    order: data,
    error,
  }
}