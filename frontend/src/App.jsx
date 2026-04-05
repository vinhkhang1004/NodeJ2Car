import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import AuthLayout from './components/AuthLayout';
import Dashboard from './pages/admin/Dashboard';

// Legacy parts removed

// Products
import ProductList from './pages/admin/ProductList';
import ProductEdit from './pages/admin/ProductEdit';
import ProductDetail from './pages/admin/ProductDetail';

// Categories
import CategoryList from './pages/admin/CategoryList';
import CategoryEdit from './pages/admin/CategoryEdit';
import CategoryDetail from './pages/admin/CategoryDetail';

import Cart from './pages/Cart';
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
    <CartProvider>
      <Router>
        <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search/:keyword" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
        </Route>

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />

            {/* Users */}
            <Route path="/admin/users" element={<UserList />} />

            {/* Legacy parts routes removed */}

            {/* Products: List → Detail → Create → Edit */}
            <Route path="/admin/products" element={<ProductList />} />
            <Route path="/admin/products/create" element={<ProductEdit />} />
            <Route path="/admin/products/:id" element={<ProductDetail />} />
            <Route path="/admin/products/:id/edit" element={<ProductEdit />} />

            {/* Categories: List → Detail → Create → Edit */}
            <Route path="/admin/categories" element={<CategoryList />} />
            <Route path="/admin/categories/create" element={<CategoryEdit />} />
            <Route path="/admin/categories/:id" element={<CategoryDetail />} />
            <Route path="/admin/categories/:id/edit" element={<CategoryEdit />} />
          </Route>
        </Route>
      </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
