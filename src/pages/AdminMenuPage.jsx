import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAdminMenuItems,
  updateMenuItemAvailability,
} from "../services/menuService.js";

function AdminMenuPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || !isAdmin) {
      return undefined;
    }

    let isActive = true;

    async function loadAdminMenu() {
      try {
        const loadedItems = await getAdminMenuItems();

        if (isActive) {
          setItems(loadedItems);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(`Unable to load menu items: ${error.message}`);
        }
      } finally {
        if (isActive) {
          setItemsLoading(false);
        }
      }
    }

    loadAdminMenu();

    return () => {
      isActive = false;
    };
  }, [user, isAdmin]);

  async function handleAvailabilityChange(menuItemId, isAvailable) {
    setUpdatingItemId(menuItemId);
    setErrorMessage("");
    setMessage("");

    const { error } = await updateMenuItemAvailability(menuItemId, isAvailable);

    if (error) {
      setErrorMessage(`Unable to update menu item: ${error.message}`);
      setUpdatingItemId(null);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === menuItemId
          ? {
              ...item,
              isAvailable,
            }
          : item,
      ),
    );

    setMessage(
      isAvailable
        ? "Menu item is now available to customers."
        : "Menu item is now unavailable to customers.",
    );

    setUpdatingItemId(null);
  }

  if (authLoading) {
    return (
      <section>
        <h2>Admin Menu Management</h2>
        <p>Checking access...</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return (
    <section className="admin-menu-page">
      <h2>Admin Menu Management</h2>

      <p>Control which menu items are currently available to customers.</p>

      {message && <p role="status">{message}</p>}

      {errorMessage && <p role="alert">{errorMessage}</p>}

      {itemsLoading ? (
        <p>Loading menu items...</p>
      ) : items.length === 0 ? (
        <p>No menu items are available to manage.</p>
      ) : (
        <div className="admin-menu-list">
          {items.map((item) => (
            <article key={item.id} className="order-card">
              <h3>{item.name}</h3>

              <p>{item.description}</p>

              <p>
                <strong>Status:</strong>{" "}
                {item.isAvailable ? "Available" : "Unavailable"}
              </p>

              <button
                type="button"
                disabled={updatingItemId === item.id}
                onClick={() =>
                  handleAvailabilityChange(item.id, !item.isAvailable)
                }
              >
                {updatingItemId === item.id
                  ? "Updating..."
                  : item.isAvailable
                    ? "Mark Unavailable"
                    : "Mark Available"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminMenuPage;
