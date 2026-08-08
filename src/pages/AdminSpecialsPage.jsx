import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createPromotion,
  deletePromotion,
  getAllPromotions,
  updatePromotion,
} from "../services/promotionService";
import { formatCurrency } from "../utils/pricing";

function sortPromotions(promotions) {
  return [...promotions].sort(
    (first, second) =>
      first.displayOrder - second.displayOrder ||
      first.code.localeCompare(second.code),
  );
}

function AdminSpecialsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [promotions, setPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user || !isAdmin) {
      return undefined;
    }

    let isActive = true;

    async function loadPromotions() {
      const {
        promotions: loadedPromotions,
        error,
      } = await getAllPromotions();

      if (!isActive) {
        return;
      }

      if (error) {
        setErrorMessage(
          `Unable to load specials: ${error.message}`,
        );
      } else {
        setPromotions(sortPromotions(loadedPromotions));
      }

      setPromotionsLoading(false);
    }

    loadPromotions();

    return () => {
      isActive = false;
    };
  }, [user, isAdmin]);

  async function handleSavePromotion(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const code =
      formData
        .get("code")
        ?.toString()
        .trim()
        .toUpperCase() ?? "";

    const description =
      formData
        .get("description")
        ?.toString()
        .trim() ?? "";

    const discountType =
      formData.get("discountType")?.toString() ?? "";

    const discountAmount = Number(
      formData.get("discountAmount"),
    );

    const minimumSubtotal = Number(
      formData.get("minimumSubtotal"),
    );

    const displayOrder = Number(
      formData.get("displayOrder"),
    );

    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      setErrorMessage(
        "Code must contain 3–30 letters, numbers, underscores, or hyphens.",
      );
      return;
    }

    if (
      description.length < 5 ||
      description.length > 200
    ) {
      setErrorMessage(
        "Description must contain 5–200 characters.",
      );
      return;
    }

    if (
      !["percentage", "fixed"].includes(discountType) ||
      !Number.isFinite(discountAmount) ||
      discountAmount <= 0 ||
      (discountType === "percentage" &&
        discountAmount > 100)
    ) {
      setErrorMessage("Enter a valid discount amount.");
      return;
    }

    if (
      !Number.isFinite(minimumSubtotal) ||
      minimumSubtotal < 0
    ) {
      setErrorMessage("Enter a valid minimum subtotal.");
      return;
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      setErrorMessage(
        "Display order must be a nonnegative integer.",
      );
      return;
    }

    const promotionValues = {
      code,
      description,
      discountType,
      discountValue:
        discountType === "percentage"
          ? Math.round(discountAmount)
          : Math.round(discountAmount * 100),
      minimumSubtotalCents: Math.round(
        minimumSubtotal * 100,
      ),
      displayOrder,
      isActive: formData.get("isActive") === "yes",
    };

    setSubmitting(true);

    if (editingPromotion) {
      const { promotion, error } =
        await updatePromotion(
          editingPromotion.id,
          promotionValues,
        );

      if (error) {
        setErrorMessage(
          `Unable to update special: ${error.message}`,
        );
      } else {
        setPromotions((current) =>
          sortPromotions(
            current.map((entry) =>
              entry.id === promotion.id
                ? promotion
                : entry,
            ),
          ),
        );

        setMessage(`${promotion.code} was updated.`);
        setEditingPromotion(null);
      }
    } else {
      const { promotion, error } =
        await createPromotion(promotionValues);

      if (error) {
        setErrorMessage(
          `Unable to create special: ${error.message}`,
        );
      } else {
        setPromotions((current) =>
          sortPromotions([...current, promotion]),
        );

        setMessage(`${promotion.code} was created.`);
        form.reset();
      }
    }

    setSubmitting(false);
  }

  async function handleTogglePromotion(promotion) {
    setUpdatingId(promotion.id);
    setMessage("");
    setErrorMessage("");

    const {
      promotion: updatedPromotion,
      error,
    } = await updatePromotion(promotion.id, {
      isActive: !promotion.isActive,
    });

    if (error) {
      setErrorMessage(
        `Unable to update special: ${error.message}`,
      );
    } else {
      setPromotions((current) =>
        current.map((entry) =>
          entry.id === updatedPromotion.id
            ? updatedPromotion
            : entry,
        ),
      );

      setMessage(`${updatedPromotion.code} was updated.`);
    }

    setUpdatingId(null);
  }

  async function handleDeletePromotion(promotion) {
    const confirmed = window.confirm(
      `Permanently remove ${promotion.code}?`,
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(promotion.id);
    setMessage("");
    setErrorMessage("");

    const { error } = await deletePromotion(
      promotion.id,
    );

    if (error) {
      setErrorMessage(
        `Unable to remove special: ${error.message}`,
      );
    } else {
      setPromotions((current) =>
        current.filter(
          (entry) => entry.id !== promotion.id,
        ),
      );

      if (editingPromotion?.id === promotion.id) {
        setEditingPromotion(null);
      }

      setMessage(`${promotion.code} was removed.`);
    }

    setUpdatingId(null);
  }

  function beginEditing(promotion) {
    setEditingPromotion(promotion);
    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing() {
    setEditingPromotion(null);
    setMessage("");
    setErrorMessage("");
  }

  if (authLoading) {
    return <p>Checking administrator access...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return (
    <section className="admin-specials-page">
      <h2>Admin Specials</h2>

      <p>
        Active specials appear on the home page and
        their codes can be applied in the cart.
      </p>

      {message && <p role="status">{message}</p>}

      {errorMessage && (
        <p role="alert">{errorMessage}</p>
      )}

      <form
        key={editingPromotion?.id ?? "new-special"}
        onSubmit={handleSavePromotion}
        noValidate
      >
        <fieldset>
          <legend>
            {editingPromotion
              ? "Edit Special"
              : "Add a Special"}
          </legend>

          <label htmlFor="special-code">
            Promotion Code
          </label>

          <input
            id="special-code"
            name="code"
            type="text"
            maxLength="30"
            defaultValue={editingPromotion?.code ?? ""}
            placeholder="PIZZA10"
            required
          />

          <label htmlFor="special-description">
            Description
          </label>

          <textarea
            id="special-description"
            name="description"
            maxLength="200"
            defaultValue={
              editingPromotion?.description ?? ""
            }
            required
          />

          <label htmlFor="discount-type">
            Discount Type
          </label>

          <select
            id="discount-type"
            name="discountType"
            defaultValue={
              editingPromotion?.discountType ??
              "percentage"
            }
          >
            <option value="percentage">
              Percentage
            </option>

            <option value="fixed">
              Fixed dollar amount
            </option>
          </select>

          <label htmlFor="discount-amount">
            Discount Amount
          </label>

          <input
            id="discount-amount"
            name="discountAmount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={
              editingPromotion
                ? editingPromotion.discountType ===
                  "percentage"
                  ? editingPromotion.discountValue
                  : editingPromotion.discountValue / 100
                : ""
            }
            required
          />

          <label htmlFor="minimum-subtotal">
            Minimum Subtotal ($)
          </label>

          <input
            id="minimum-subtotal"
            name="minimumSubtotal"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              editingPromotion
                ? editingPromotion.minimumSubtotalCents /
                100
                : 0
            }
            required
          />

          <label htmlFor="display-order">
            Display Order
          </label>

          <input
            id="display-order"
            name="displayOrder"
            type="number"
            min="0"
            step="1"
            defaultValue={
              editingPromotion?.displayOrder ?? 0
            }
            required
          />

          <label>
            <input
              name="isActive"
              type="checkbox"
              value="yes"
              defaultChecked={
                editingPromotion?.isActive ?? true
              }
            />

            Show this special on the home page
          </label>

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : editingPromotion
                ? "Save Changes"
                : "Add Special"}
          </button>

          {editingPromotion && (
            <button
              type="button"
              disabled={submitting}
              onClick={cancelEditing}
            >
              Cancel Editing
            </button>
          )}
        </fieldset>
      </form>

      <section>
        <h3>Existing Specials</h3>

        {promotionsLoading ? (
          <p>Loading specials...</p>
        ) : promotions.length === 0 ? (
          <p>No specials have been created.</p>
        ) : (
          <div className="specials-grid">
            {promotions.map((promotion) => (
              <article
                key={promotion.id}
                className="special-card"
              >
                <h4>{promotion.code}</h4>

                <p>{promotion.description}</p>

                <p>
                  <strong>Discount:</strong>{" "}
                  {promotion.discountType ===
                    "percentage"
                    ? `${promotion.discountValue}%`
                    : formatCurrency(
                      promotion.discountValue,
                    )}
                </p>

                <p>
                  <strong>Minimum:</strong>{" "}
                  {formatCurrency(
                    promotion.minimumSubtotalCents,
                  )}
                </p>

                <p>
                  <strong>Display order:</strong>{" "}
                  {promotion.displayOrder}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {promotion.isActive
                    ? "Active"
                    : "Inactive"}
                </p>

                <button
                  type="button"
                  disabled={
                    updatingId === promotion.id
                  }
                  onClick={() =>
                    beginEditing(promotion)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={
                    updatingId === promotion.id
                  }
                  onClick={() =>
                    handleTogglePromotion(promotion)
                  }
                >
                  {promotion.isActive
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  type="button"
                  disabled={
                    updatingId === promotion.id
                  }
                  onClick={() =>
                    handleDeletePromotion(promotion)
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminSpecialsPage;