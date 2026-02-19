import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Amplify } from 'aws-amplify'
import './index.css'  // Ye missing hogi toh design nahi aayega

console.log("ENV CHECK:", {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
  region: import.meta.env.VITE_AWS_REGION,
})

// Sabse pehle config
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN,
          scopes: ['openid', 'profile', 'email'],
redirectSignIn: [
  'http://localhost:8080/auth',
  'https://main.d1mzxedhtb65tt.amplifyapp.com/auth'
],
redirectSignOut: [
  'http://localhost:8080/auth',
  'https://main.d1mzxedhtb65tt.amplifyapp.com/auth'
],

          responseType: 'code',
        }
      }
    }
  }
});



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)