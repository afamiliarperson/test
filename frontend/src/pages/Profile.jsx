import { useState, useContext } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    
    // Profile form
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await api.put('/auth/profile', { full_name: fullName });
            // Update context user loosely (in a real app, you might fetch profile again)
            const token = localStorage.getItem('token');
            login(token, { ...user, full_name: fullName });
            toast.success('Cập nhật hồ sơ thành công');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi cập nhật hồ sơ');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        try {
            await api.put('/auth/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
            toast.success('Đổi mật khẩu thành công');
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi đổi mật khẩu');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 h-fit">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Thông tin cá nhân</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" disabled className="mt-1 block w-full border rounded p-2 bg-gray-50 text-gray-500" value={user?.email || ''} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                        <input type="text" disabled className="mt-1 block w-full border rounded p-2 bg-gray-50 text-gray-500" value={user?.role === 'giang_vien' ? 'Giảng viên' : 'Sinh viên'} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                        <input type="text" required className="mt-1 block w-full border rounded p-2" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <button type="submit" disabled={profileLoading} className="px-4 py-2 bg-school-blue-600 text-white rounded hover:bg-school-blue-700 disabled:opacity-50">
                        {profileLoading ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6 h-fit">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Đổi mật khẩu</h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ</label>
                        <input type="password" required className="mt-1 block w-full border rounded p-2" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                        <input type="password" required minLength="8" className="mt-1 block w-full border rounded p-2" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <button type="submit" disabled={passwordLoading} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50">
                        {passwordLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
