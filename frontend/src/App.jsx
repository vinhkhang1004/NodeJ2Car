import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PartDetail from './pages/PartDetail';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import PartList from './pages/admin/PartList';
import PartEdit from './pages/admin/PartEdit';
import UserList from './pages/admin/UserList';

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="container mt-8 animate-fade-in">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search/:keyword" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/part/:id" element={<PartDetail />} />
        </Route>
        
        <Route element={<AdminRoute />}>
           <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/parts" element={<PartList />} />
              <Route path="/admin/part/create" element={<PartEdit />} />
              <Route path="/admin/part/:id/edit" element={<PartEdit />} />
              <Route path="/admin/users" element={<UserList />} />
           </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
