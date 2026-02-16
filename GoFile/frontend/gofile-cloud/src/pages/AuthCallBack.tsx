import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@aws-amplify/auth";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        await getCurrentUser();
        navigate("/my-files", { replace: true });
      } catch (e) {
        console.error("Auth callback failed:", e);
        navigate("/auth", { replace: true });
      }
    };

    run();
  }, [navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Signing you in…</h2>
      <p>Please wait.</p>
    </div>
  );
}