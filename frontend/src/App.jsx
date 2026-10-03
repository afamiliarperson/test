import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SearchRooms from './pages/SearchRooms';
import RoomDetails from './pages/RoomDetails';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

import AdminRoute from './components/AdminRoute';
import Dashboard from './pages/admin/Dashboard';
import ManageRooms from './pages/admin/ManageRooms';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBookings from './pages/admin/ManageBookings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Home />} />
            <Route path="rooms" element={<SearchRooms />} />
            <Route path="rooms/:id" element={<RoomDetails />} />
            <Route path="rooms/:id/book" element={<BookRoom />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="bookings" element={<ManageBookings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
