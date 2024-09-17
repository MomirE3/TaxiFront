import React from 'react';
import './App.css';
import { Router } from './Router/Router';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID!}>
      <Router/>
    </GoogleOAuthProvider>
  );
}

export default App;
