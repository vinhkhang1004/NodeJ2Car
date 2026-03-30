import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PartDetail from './pages/PartDetail';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container mt-8 animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:keyword" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/part/:id" element={<PartDetail />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
