// contexts/BaseContext.js
import React, { createContext, useContext } from 'react';
import { useWebSocket } from '../../../hooks/socket/base/useWebSocket';

const BaseContext = createContext(null);

export const BaseProvider = ({ children }) => {
  const websocketHook = useWebSocket();
  
  return (
    <BaseContext.Provider value={websocketHook}>
      {children}
    </BaseContext.Provider>
  );
};

export const useBase = () => {
  const context = useContext(BaseContext);
  if (!context) {
    throw new Error('useBase must be used within a BaseProvider');
  }
  return context;
};