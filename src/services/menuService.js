// Menu data-access layer.
// Menu content comes from menu.json, while item availability
// can be controlled by administrators through Supabase.

import menuData from '../data/menu.json'
import { supabase } from '../lib/supabase'

function activeOnly(entry) {
  return entry.isActive
}

async function getAvailabilityMap() {
  const { data, error } = await supabase
    .from('menu_item_availability')
    .select('menu_item_id, is_available')

  if (error) {
    throw error
  }

  return new Map(
    (data ?? []).map((entry) => [
      entry.menu_item_id,
      entry.is_available,
    ]),
  )
}

function itemIsAvailable(item, availabilityMap) {
  if (!item.isActive) {
    return false
  }

  // If no database override exists, keep the JSON item's
  // original active setting.
  return availabilityMap.get(item.id) ?? true
}

export async function getMenu() {
  const availabilityMap = await getAvailabilityMap()

  const categories = menuData.categories
    .filter(activeOnly)
    .sort(
      (first, second) =>
        first.displayOrder - second.displayOrder,
    )

  return categories.map((category) => ({
    ...category,

    items: menuData.items.filter(
      (item) =>
        item.categoryId === category.id &&
        itemIsAvailable(item, availabilityMap),
    ),
  }))
}

export async function getMenuItem(itemId) {
  const numericId = Number(itemId)

  if (!Number.isInteger(numericId)) {
    return null
  }

  const item =
    menuData.items.find(
      (menuItem) =>
        menuItem.isActive &&
        menuItem.id === numericId,
    ) ?? null

  if (!item) {
    return null
  }

  const availabilityMap = await getAvailabilityMap()

  if (!itemIsAvailable(item, availabilityMap)) {
    return null
  }

  return item
}

export async function getPizzaOptions() {
  return {
    sizes: menuData.sizes.filter(activeOnly),
    crusts: menuData.crusts.filter(activeOnly),
    toppings: menuData.toppings.filter(activeOnly),
  }
}

// Returns every active JSON menu item for the admin dashboard,
// including items currently marked unavailable to customers.
export async function getAdminMenuItems() {
  const availabilityMap = await getAvailabilityMap()

  return menuData.items
    .filter(activeOnly)
    .map((item) => ({
      ...item,
      isAvailable:
        availabilityMap.get(item.id) ?? true,
    }))
}

// Allows an authorized admin to change whether a menu item
// is available to customers.
export async function updateMenuItemAvailability(
  menuItemId,
  isAvailable,
) {
  const { data, error } = await supabase
    .from('menu_item_availability')
    .update({
      is_available: isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq('menu_item_id', menuItemId)
    .select()

  if (error) {
    return {
      item: null,
      error,
    }
  }

  if (!data || data.length === 0) {
    return {
      item: null,
      error: new Error(
        'Menu item availability could not be updated.',
      ),
    }
  }

  return {
    item: data[0],
    error: null,
  }
}