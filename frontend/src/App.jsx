import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PartDetail from './pages/PartDetail';
import AdminRoute from './components/AdminRoute';
import Dashboard from './pages/admin/Dashboard';
import PartList from './pages/admin/PartList';
import UserList from './pages/admin/UserList';

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
          
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/parts" element={<PartList />} />
            <Route path="/admin/users" element={<UserList />} />
          </Route>
        </Routes>
      </main>
    </Router>
  );
}

export default App;
