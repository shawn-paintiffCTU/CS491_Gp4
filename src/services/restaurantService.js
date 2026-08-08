// Restaurant data-access layer used by the home page.
import restaurantData from "../data/restaurant.json";

export async function getRestaurantInformation() {
  return restaurantData;
}
