import { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { BookOpen, User, LogOut, Home, Search, Calendar, UserCircle } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="bg-school-blue-600 text-white shadow-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
                        <BookOpen size={24} />
                        <span>Hệ thống Đặt phòng</span>
                    </Link>

                    {user && (
                        <div className="flex items-center space-x-6">
                            {user.role === 'admin' ? (
                                <>
                                    <Link to="/admin/dashboard" className="hover:text-school-blue-100 flex items-center"><Home size={18} className="mr-1"/>Dashboard</Link>
                                    <Link to="/admin/rooms" className="hover:text-school-blue-100 flex items-center"><Search size={18} className="mr-1"/>Phòng</Link>
                                    <Link to="/admin/users" className="hover:text-school-blue-100 flex items-center"><User size={18} className="mr-1"/>Người dùng</Link>
                                    <Link to="/admin/bookings" className="hover:text-school-blue-100 flex items-center"><Calendar size={18} className="mr-1"/>Lượt đặt</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="hover:text-school-blue-100 flex items-center"><Home size={18} className="mr-1"/>Trang chủ</Link>
                                    <Link to="/rooms" className="hover:text-school-blue-100 flex items-center"><Search size={18} className="mr-1"/>Tìm phòng</Link>
                                    <Link to="/my-bookings" className="hover:text-school-blue-100 flex items-center"><Calendar size={18} className="mr-1"/>Lịch của tôi</Link>
                                </>
                            )}
                            
                            <div className="flex items-center space-x-4 border-l border-school-blue-400 pl-4">
                                <Link to="/profile" className="flex items-center hover:text-school-blue-100">
                                    <UserCircle size={20} className="mr-1" />
                                    {user.full_name} ({user.role === 'giang_vien' ? 'GV' : 'SV'})
                                </Link>
                                <button onClick={handleLogout} className="flex items-center hover:text-red-200">
                                    <LogOut size={18} className="mr-1"/>Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>

            <footer className="bg-gray-800 text-white py-6 text-center">
                <p>&copy; 2026 Đồ án môn học - Nhập môn Công nghệ phần mềm</p>
            </footer>
        </div>
    );
};

export default Layout;
