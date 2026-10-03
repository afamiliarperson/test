import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { Lock, Unlock, KeyRound, ShieldAlert } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users?role=${filterRole}&search=${searchTerm}`);
            setUsers(res.data);
        } catch (err) {
            toast.error('Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleToggleLock = async (id, currentStatus) => {
        if (!window.confirm(`Bạn muốn ${currentStatus === 'active' ? 'KHÓA' : 'MỞ KHÓA'} người dùng này?`)) return;
        try {
            await api.put(`/users/${id}/lock`);
            toast.success('Đã cập nhật trạng thái');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi thao tác');
        }
    };

    const handleChangeRole = async (id, newRole) => {
        if (!window.confirm('Xác nhận đổi vai trò người dùng này?')) return;
        try {
            await api.put(`/users/${id}/role`, { role: newRole });
            toast.success('Đã đổi vai trò');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi đổi vai trò');
        }
    };

    const handleResetPassword = async (id) => {
        if (!window.confirm('Đặt lại mật khẩu thành "12345678"?')) return;
        try {
            await api.put(`/users/${id}/reset-password`);
            toast.success('Đã đặt lại mật khẩu');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi đặt lại mật khẩu');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
                    <input type="text" placeholder="Tìm theo tên hoặc email..." className="flex-1 border rounded p-2" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <select className="border rounded p-2" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                        <option value="">Tất cả vai trò</option>
                        <option value="sinh_vien">Sinh viên</option>
                        <option value="giang_vien">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                    <button type="submit" className="bg-school-blue-600 text-white px-6 py-2 rounded hover:bg-school-blue-700">Tìm kiếm</button>
                </form>

                {loading ? <div className="text-center py-10">Đang tải...</div> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select 
                                                value={u.role} 
                                                onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                                disabled={u.role === 'admin'}
                                                className="border-none bg-transparent focus:ring-0 text-sm font-semibold"
                                            >
                                                <option value="sinh_vien">Sinh viên</option>
                                                <option value="giang_vien">Giảng viên</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            {u.role !== 'admin' && (
                                                <>
                                                    <button onClick={() => handleToggleLock(u.id, u.status)} className="text-gray-600 hover:text-gray-900" title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}>
                                                        {u.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                                                    </button>
                                                    <button onClick={() => handleResetPassword(u.id)} className="text-orange-600 hover:text-orange-900" title="Đặt lại mật khẩu">
                                                        <KeyRound size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Không tìm thấy người dùng.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
