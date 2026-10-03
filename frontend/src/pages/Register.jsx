import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'sinh_vien'
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Đăng ký thành công, vui lòng đăng nhập');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Đăng ký thất bại');
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
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng ký tài khoản</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                        <input 
                            type="text" required 
                            className="mt-1 block w-full rounded-md border p-2"
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" required 
                            className="mt-1 block w-full rounded-md border p-2"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu (ít nhất 8 ký tự)</label>
                        <input 
                            type="password" required minLength="8"
                            className="mt-1 block w-full rounded-md border p-2"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                        <select 
                            className="mt-1 block w-full rounded-md border p-2"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="sinh_vien">Sinh viên</option>
                            <option value="giang_vien">Giảng viên</option>
                        </select>
                    </div>
                    <button 
                        type="submit" disabled={loading}
                        className="w-full py-2 px-4 rounded-md text-white bg-school-blue-600 hover:bg-school-blue-700"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-600">
                    Đã có tài khoản? <Link to="/login" className="text-school-blue-600 font-medium">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
