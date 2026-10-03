import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axios';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterRoom, setFilterRoom] = useState('');
    const [filterUser, setFilterUser] = useState('');
    
    const [rooms, setRooms] = useState([]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterDate) params.append('date', filterDate);
            if (filterStatus) params.append('status', filterStatus);
            if (filterRoom) params.append('room_id', filterRoom);

            const [bRes, rRes] = await Promise.all([
                api.get(`/bookings?${params.toString()}`),
                api.get('/rooms?all=true')
            ]);
            
            let data = bRes.data;
            if (filterUser) {
                const term = filterUser.toLowerCase();
                data = data.filter(b => b.user_name.toLowerCase().includes(term) || b.email.toLowerCase().includes(term));
            }
            
            setBookings(data);
            setRooms(rRes.data);
        } catch (err) {
            toast.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filterDate, filterStatus, filterRoom, filterUser]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/bookings/${id}/approve`);
            toast.success('Đã duyệt lượt đặt');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi duyệt lượt đặt');
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Nhập lý do từ chối:');
        if (reason === null) return;
        try {
            await api.put(`/bookings/${id}/reject`, { reason });
            toast.success('Đã từ chối lượt đặt');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi từ chối lượt đặt');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn là Admin. Xác nhận hủy lượt đặt này? Hành động này không thể hoàn tác.')) return;
        try {
            await api.put(`/bookings/${id}/cancel`);
            toast.success('Đã hủy lượt đặt');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi hủy lượt đặt');
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            cho_duyet: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            da_duyet: 'bg-blue-100 text-blue-800 border border-blue-200',
            tu_choi: 'bg-red-100 text-red-800 border border-red-200',
            da_huy: 'bg-gray-100 text-gray-800 border border-gray-300',
            hoan_thanh: 'bg-green-100 text-green-800 border border-green-200'
        };
        const labels = {
            cho_duyet: 'Chờ duyệt',
            da_duyet: 'Đã duyệt',
            tu_choi: 'Từ chối',
            da_huy: 'Đã hủy',
            hoan_thanh: 'Hoàn thành'
        };
        return <span className={`px-2 py-1 text-xs rounded-full ${styles[status]}`}>{labels[status]}</span>;
    };

    // Group by date
    const groupedBookings = useMemo(() => {
        const groups = {};
        bookings.forEach(b => {
            const bDate = b.start_time.includes('T') ? parseISO(b.start_time) : new Date(b.start_time.replace(' ', 'T'));
            const dateStr = format(bDate, 'EEEE, dd/MM/yyyy', { locale: vi });
            const capitalizedDateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            if (!groups[capitalizedDateStr]) {
                groups[capitalizedDateStr] = [];
            }
            groups[capitalizedDateStr].push(b);
        });
        return groups;
    }, [bookings]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold">Quản lý toàn bộ lượt đặt</h2>
            </div>

            <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="border rounded p-2" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
                    <option value="">Tất cả phòng</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <input type="text" placeholder="Tìm theo tên/email người đặt..." className="border rounded p-2" value={filterUser} onChange={e => setFilterUser(e.target.value)} />
                <input type="date" className="border rounded p-2" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                <select className="border rounded p-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="cho_duyet">Chờ duyệt</option>
                    <option value="da_duyet">Đã duyệt</option>
                    <option value="hoan_thanh">Hoàn thành</option>
                    <option value="tu_choi">Từ chối</option>
                    <option value="da_huy">Đã hủy</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải...</div>
            ) : Object.keys(groupedBookings).length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow text-center text-gray-500 border border-gray-100">
                    Không có lượt đặt nào phù hợp.
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(groupedBookings).map(dateStr => (
                        <div key={dateStr} className="bg-white p-5 rounded-lg shadow">
                            <h3 className="font-bold text-lg text-school-blue-800 mb-4 pb-2 border-b-2 border-school-blue-100">
                                {dateStr}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người đặt</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mục đích</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {groupedBookings[dateStr].map(b => {
                                            const bStart = b.start_time.includes('T') ? parseISO(b.start_time) : new Date(b.start_time.replace(' ', 'T'));
                                            const bEnd = b.end_time.includes('T') ? parseISO(b.end_time) : new Date(b.end_time.replace(' ', 'T'));
                                            return (
                                                <tr key={b.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {format(bStart, 'HH:mm')} - {format(bEnd, 'HH:mm')}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-school-blue-600 font-semibold">{b.room_name}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                        <div className="font-medium text-gray-900">{b.user_name}</div>
                                                        <div className="text-gray-500 text-xs">{b.email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {b.purpose} <span className="text-xs text-gray-400">({b.attendees} người)</span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <StatusBadge status={b.status} />
                                                        {b.reject_reason && <div className="text-xs text-red-500 mt-1 truncate max-w-[120px]" title={b.reject_reason}>Lý do: {b.reject_reason}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm space-x-2">
                                                        {b.status === 'cho_duyet' && (
                                                            <>
                                                                <button onClick={() => handleApprove(b.id)} className="text-green-600 hover:text-green-900" title="Duyệt"><CheckCircle size={18} /></button>
                                                                <button onClick={() => handleReject(b.id)} className="text-red-600 hover:text-red-900" title="Từ chối"><XCircle size={18} /></button>
                                                            </>
                                                        )}
                                                        {['cho_duyet', 'da_duyet'].includes(b.status) && (
                                                            <button onClick={() => handleCancel(b.id)} className="text-gray-400 hover:text-gray-700 ml-2" title="Hủy lượt đặt"><Trash2 size={18} /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageBookings;
