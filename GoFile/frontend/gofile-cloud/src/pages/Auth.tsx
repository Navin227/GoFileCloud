import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithRedirect, fetchAuthSession } from '@aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          navigate("/home", { replace: true });
        }
      } catch (e) {
        console.log("No session.");
      }
    };

    const unsubscribe = Hub.listen('auth', ({ payload }: any) => {
      if (payload.event === 'signedIn') {
        checkUser();
      }
    });

    checkUser();
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top left, #1f2937, #0f172a)",
        fontFamily: "Inter, sans-serif",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "850px",
          padding: "70px 60px",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(25px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            marginBottom: "15px",
            letterSpacing: "2px",
          }}
        >
          ☁ GoFile
        </h1>

        <p
          style={{
            fontSize: "22px",
            opacity: 0.8,
            marginBottom: "50px",
          }}
        >
          Process. Compress. Convert. Powered by the Cloud.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
            marginBottom: "55px",
            fontSize: "15px",
            opacity: 0.75,
          }}
        >
          <span>⚡ Fast Processing</span>
          <span>🔐 Secure Storage</span>
          <span>📂 PDF Toolkit</span>
          <span>🤖 AI Summary</span>
        </div>

        <button
          onClick={() => signInWithRedirect({ provider: 'Google' })}
          style={{
            padding: "18px 55px",
            fontSize: "18px",
            borderRadius: "60px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            background: "linear-gradient(90deg, #ffffff, #d4d4d8)",
            color: "#000",
            boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
            transition: "all 0.25s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Continue with Google →
        </button>

        <p
          style={{
            marginTop: "40px",
            fontSize: "13px",
            opacity: 0.5,
          }}
        >
          Secure • Serverless • Scalable
        </p>
      </div>
    </div>
  );
}