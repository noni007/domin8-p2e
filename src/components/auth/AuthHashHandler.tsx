import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Handles Supabase auth hash fragments (e.g. #access_token=...&type=recovery)
// and redirects to the appropriate route with query parameters.
export const AuthHashHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash?.startsWith("#")
      ? window.location.hash.slice(1)
      : "";

    if (!hash) return;

    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    // Handle password recovery specifically
    if (type === "recovery" && accessToken && refreshToken) {
      const qs = new URLSearchParams({
        type,
        access_token: accessToken,
        refresh_token: refreshToken,
      }).toString();

      // Clear the hash and redirect to reset-password with query params
      navigate(`/reset-password?${qs}`,
        { replace: true }
      );
      return;
    }
  }, [location, navigate]);

  return null;
};
