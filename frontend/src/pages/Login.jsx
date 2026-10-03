import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            toast.success('Đăng nhập thành công');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex justify-center mb-6 text-school-blue-600">
                    <BookOpen size={48} />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng nhập hệ thống</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-school-blue-500 focus:border-school-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input 
                            type="password" 
                            required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-school-blue-500 focus:border-school-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-school-blue-600 hover:bg-school-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600">
                    Chưa có tài khoản? <Link to="/register" className="text-school-blue-600 font-medium">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
