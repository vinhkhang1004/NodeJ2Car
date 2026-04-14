import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PartDetail from './pages/PartDetail';
import Shop from './pages/Shop';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/AdminLayout';
import AuthLayout from './components/AuthLayout';
import Dashboard from './pages/admin/Dashboard';
import Profile from './pages/Profile';
import Shipping from './pages/Shipping';
import Payment from './pages/Payment';
import PlaceOrder from './pages/PlaceOrder';
import OrderResult from './pages/OrderResult';
import Wishlist from './pages/Wishlist';

// Legacy parts removed

// Products
import ProductList from './pages/admin/ProductList';
import ProductEdit from './pages/admin/ProductEdit';
import ProductDetail from './pages/admin/ProductDetail';

// Categories
import CategoryList from './pages/admin/CategoryList';
import CategoryEdit from './pages/admin/CategoryEdit';
import CategoryDetail from './pages/admin/CategoryDetail';

import ChatManagement from './pages/admin/ChatManagement';
import ChatWidget from './components/ChatWidget';

import Cart from './pages/Cart';
import UserList from './pages/admin/UserList';
import OrderList from './pages/admin/OrderList';
import OrderInfo from './pages/admin/OrderInfo';
import ReviewList from './pages/admin/ReviewList';
import CouponManagement from './pages/admin/CouponManagement';
import Offers from './pages/Offers';



function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="animate-fade-in">
        <Outlet />
      </main>
      <ChatWidget />
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
          <Route path="/shop" element={<Shop />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/search/:keyword" element={<Shop />} />

          <Route path="/part/:id" element={<PartDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/placeorder" element={<PlaceOrder />} />
            <Route path="/order-success/:id" element={<OrderResult />} />
          </Route>
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

            {/* Chat */}
            <Route path="/admin/chat" element={<ChatManagement />} />

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

            {/* Orders */}
            <Route path="/admin/orders" element={<OrderList />} />
            <Route path="/admin/orders/:id" element={<OrderInfo />} />

            {/* Reviews */}
            <Route path="/admin/reviews" element={<ReviewList />} />

            {/* Coupons */}
            <Route path="/admin/coupons" element={<CouponManagement />} />

          </Route>
        </Route>
      </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

