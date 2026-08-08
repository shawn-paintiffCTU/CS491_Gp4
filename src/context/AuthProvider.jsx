import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";

const DEFAULT_ROLE = "customer";

function mapPaymentMethod(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    cardholderName: record.cardholder_name,
    cardBrand: record.card_brand,
    lastFour: record.last_four,
    expirationMonth: record.expiration_month,
    expirationYear: record.expiration_year,
    updatedAt: record.updated_at,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadAccount(authUser) {
      if (!authUser) {
        if (isActive) {
          setUser(null);
          setProfile(null);
          setRole(null);
          setPaymentMethod(null);
          setLoading(false);
        }

        return;
      }

      if (isActive) {
        setLoading(true);
        setUser(authUser);
      }

      const [profileResult, roleResult, paymentMethodResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, phone, created_at, updated_at")
            .eq("id", authUser.id)
            .maybeSingle(),

          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", authUser.id)
            .maybeSingle(),

          supabase
            .from("saved_payment_methods")
            .select(
              `
            id,
            cardholder_name,
            card_brand,
            last_four,
            expiration_month,
            expiration_year,
            updated_at
          `,
            )
            .eq("user_id", authUser.id)
            .maybeSingle(),
        ]);

      if (!isActive) {
        return;
      }

      if (profileResult.error) {
        console.error("Profile error:", profileResult.error.message);
      }

      if (roleResult.error) {
        console.error("Role error:", roleResult.error.message);
      }

      if (paymentMethodResult.error) {
        console.error(
          "Saved payment method error:",
          paymentMethodResult.error.message,
        );
      }

      setProfile(profileResult.data ?? null);
      setRole(roleResult.data?.role ?? DEFAULT_ROLE);
      setPaymentMethod(mapPaymentMethod(paymentMethodResult.data));
      setLoading(false);
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
      }

      await loadAccount(data.session?.user ?? null);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadAccount(session?.user ?? null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  function register(email, password) {
    return supabase.auth.signUp({
      email,
      password,
    });
  }

  function login(email, password) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  function logout() {
    return supabase.auth.signOut();
  }

  async function updateProfile({ fullName, phone }) {
    if (!user) {
      return {
        data: null,
        error: new Error("You must be signed in."),
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      })
      .eq("id", user.id)
      .select("id, full_name, phone, created_at, updated_at")
      .single();

    if (!error) {
      setProfile(data);
    }

    return { data, error };
  }

  async function savePaymentMethod(method) {
    if (!user) {
      return {
        data: null,
        error: new Error("You must be signed in."),
      };
    }

    const { data, error } = await supabase
      .from("saved_payment_methods")
      .upsert(
        {
          user_id: user.id,
          cardholder_name: method.cardholderName,
          card_brand: method.cardBrand,
          last_four: method.lastFour,
          expiration_month: method.expirationMonth,
          expiration_year: method.expirationYear,
        },
        {
          onConflict: "user_id",
        },
      )
      .select(
        `
        id,
        cardholder_name,
        card_brand,
        last_four,
        expiration_month,
        expiration_year,
        updated_at
      `,
      )
      .single();

    if (!error) {
      setPaymentMethod(mapPaymentMethod(data));
    }

    return {
      data: mapPaymentMethod(data),
      error,
    };
  }

  async function deletePaymentMethod() {
    if (!user) {
      return {
        error: new Error("You must be signed in."),
      };
    }

    const { error } = await supabase
      .from("saved_payment_methods")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setPaymentMethod(null);
    }

    return { error };
  }

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        paymentMethod,
        isAdmin,
        loading,
        register,
        login,
        logout,
        updateProfile,
        savePaymentMethod,
        deletePaymentMethod,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
