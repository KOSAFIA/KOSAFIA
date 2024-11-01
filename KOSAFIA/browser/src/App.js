// App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameRoom from "./pages/GameRoom";
import Login from "./user/Login";
import Register from "./user/Register";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameRoom />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;