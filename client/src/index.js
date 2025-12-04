import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { MatchesProvider } from './context/MatchesContext';
import { RoundsProvider } from './context/RoundContext';
import { PlayersProvider } from './context/PlayerContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminAuthProvider>
      <PlayersProvider>
      <RoundsProvider>
        <MatchesProvider>
          <App />
        </MatchesProvider> 
      </RoundsProvider> 
      </PlayersProvider>     
    </AdminAuthProvider>
  </React.StrictMode>
);

