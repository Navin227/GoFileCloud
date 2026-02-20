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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: '#fff' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>GoFile</h1>
      <button 
        onClick={() => signInWithRedirect({ provider: 'Google' })}
        style={{ 
          padding: '15px 40px', 
          fontSize: '20px', 
          cursor: 'pointer', 
          backgroundColor: '#fff', 
          color: '#000', 
          border: 'none', 
          borderRadius: '10px',
          fontWeight: 'bold'
        }}
      >
        Login with Google
      </button>
    </div>
  );
}