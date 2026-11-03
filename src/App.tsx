import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { AppLayout } from './components/layout/AppLayout';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <AppLayout />
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
