import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AllUsersPage from './pages/AllUsersPage'; 
import ManagerTransactionsPage from './pages/ManagerTransactionsPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import ManageEventPage from './pages/ManageEventPage'; 
import PromotionsPage from './pages/PromotionsPage';
import CreatePromotionPage from './pages/CreatePromotionPage';
import EditPromotionPage from './pages/EditPromotionPage'; 
import TransactionsPage from './pages/TransactionsPage'; 
import TransferPage from './pages/TransferPage';
import RedeemPointsPage from './pages/RedeemPointsPage';
import ProcessRedemptionPage from './pages/ProcessRedemptionPage';
import Navbar from './components/Navbar';
import CreateUserPage from './pages/CreateUserPage';
import CashierPage from './pages/CashierPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes (Authenticated) */}
        <Route element={<ProtectedRoute requiredRole="regular" />}>
          {/* ROOT PATH is now the Dashboard */}
          <Route path="/" element={<DashboardPage />} /> 
          
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transfer" element={<TransferPage />} /> 
          <Route path="/redeem" element={<RedeemPointsPage />} />
        </Route>

        {/* Manager-only Routes */}
        <Route element={<ProtectedRoute requiredRole="manager" />}>
          <Route path="/users" element={<AllUsersPage />} />
          <Route path="/users/new" element={<CreateUserPage />} />
          
          <Route path="/events/new" element={<CreateEventPage />} />
          <Route path="/events/:id/manage" element={<ManageEventPage />} />
          
          <Route path="/promotions/new" element={<CreatePromotionPage />} />
          <Route path="/promotions/:id/edit" element={<EditPromotionPage />} /> 
          
          <Route path="/manager/transactions" element={<ManagerTransactionsPage />} />
        </Route>

        {/* Cashier Routes */}
        <Route element={<ProtectedRoute requiredRole="cashier" />}>
          <Route path="/redeem/process" element={<ProcessRedemptionPage />} />
          <Route path="/cashier" element={<CashierPage />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/unauthorized" element={<div>403 Unauthorized</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;