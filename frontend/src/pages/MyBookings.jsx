import { useState, useEffect, useMemo } from 'react';
import api from '../utils/axios';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // upcoming, past, cancelled

    // Local filters
    const [searchRoom, setSearchRoom] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/bookings/me?filter=${filter}`);
            setBookings(res.data);
        } catch (err) {
            toast.error('Lỗi khi tải lịch đặt');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        // Reset local filters when tab changes
        setSearchRoom('');
        setFilterDate('');
        setFilterStatus('');
    }, [filter]);

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy lịch đặt này không? Hành động này không thể hoàn tác.')) return;
        
        try {
            await api.put(`/bookings/${id}/cancel`);
            toast.success('Đã hủy lịch thành công');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Không thể hủy lịch này');
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            cho_duyet: 'bg-yellow-100 text-yellow-800',
            da_duyet: 'bg-blue-100 text-blue-800',
            tu_choi: 'bg-red-100 text-red-800',
            da_huy: 'bg-gray-200 text-gray-800',
            hoan_thanh: 'bg-green-100 text-green-800'
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

    // Filter and group bookings
    const groupedBookings = useMemo(() => {
        // Apply local filters
        const filtered = bookings.filter(b => {
            const matchRoom = b.room_name.toLowerCase().includes(searchRoom.toLowerCase());
            const matchStatus = filterStatus ? b.status === filterStatus : true;
            // Handle both UTC ISO string and local string from seed
            const bDate = b.start_time.includes('T') ? parseISO(b.start_time) : new Date(b.start_time.replace(' ', 'T'));
            const bDateString = format(bDate, 'yyyy-MM-dd');
            const matchDate = filterDate ? bDateString === filterDate : true;
            
            return matchRoom && matchStatus && matchDate;
        });

        // Group by date
        const groups = {};
        filtered.forEach(b => {
            const bDate = b.start_time.includes('T') ? parseISO(b.start_time) : new Date(b.start_time.replace(' ', 'T'));
            const dateStr = format(bDate, 'EEEE, dd/MM/yyyy', { locale: vi });
            // Capitalize first letter of day
            const capitalizedDateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            if (!groups[capitalizedDateStr]) {
                groups[capitalizedDateStr] = [];
            }
            groups[capitalizedDateStr].push(b);
        });

        return groups;
    }, [bookings, searchRoom, filterDate, filterStatus]);

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Lịch đặt phòng của tôi</h2>
            
            <div className="flex space-x-1 border-b mb-6">
                <button className={`px-4 py-2 font-medium ${filter === 'upcoming' ? 'border-b-2 border-school-blue-600 text-school-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFilter('upcoming')}>Sắp tới & Hiện tại</button>
                <button className={`px-4 py-2 font-medium ${filter === 'past' ? 'border-b-2 border-school-blue-600 text-school-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFilter('past')}>Đã qua</button>
                <button className={`px-4 py-2 font-medium ${filter === 'cancelled' ? 'border-b-2 border-school-blue-600 text-school-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setFilter('cancelled')}>Đã hủy / Từ chối</button>
            </div>

            {/* Local Filters */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input type="text" placeholder="Tìm theo tên phòng..." className="w-full border rounded p-2" value={searchRoom} onChange={e => setSearchRoom(e.target.value)} />
                </div>
                <div>
                    <input type="date" className="w-full border rounded p-2" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                </div>
                <div>
                    <select className="w-full border rounded p-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        {filter === 'upcoming' && (
                            <>
                                <option value="cho_duyet">Chờ duyệt</option>
                                <option value="da_duyet">Đã duyệt</option>
                            </>
                        )}
                        {filter === 'past' && (
                            <>
                                <option value="hoan_thanh">Hoàn thành</option>
                                <option value="cho_duyet">Chờ duyệt (Quá hạn)</option>
                                <option value="da_duyet">Đã duyệt (Quá hạn)</option>
                            </>
                        )}
                        {filter === 'cancelled' && (
                            <>
                                <option value="da_huy">Đã hủy</option>
                                <option value="tu_choi">Từ chối</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải...</div>
            ) : Object.keys(groupedBookings).length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow text-center text-gray-500 border border-gray-100">
                    Không có lượt đặt phòng nào phù hợp.
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(groupedBookings).map(dateStr => (
                        <div key={dateStr}>
                            <h3 className="font-bold text-lg text-school-blue-800 mb-4 pb-2 border-b-2 border-school-blue-100">
                                {dateStr}
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {groupedBookings[dateStr].map(b => {
                                    const bStart = b.start_time.includes('T') ? parseISO(b.start_time) : new Date(b.start_time.replace(' ', 'T'));
                                    const bEnd = b.end_time.includes('T') ? parseISO(b.end_time) : new Date(b.end_time.replace(' ', 'T'));
                                    return (
                                        <div key={b.id} className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                                            <div className="space-y-2 mb-4 md:mb-0">
                                                <div className="flex items-center space-x-3">
                                                    <h4 className="font-bold text-lg">{b.room_name}</h4>
                                                    <StatusBadge status={b.status} />
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <strong>Thời gian:</strong> {format(bStart, 'HH:mm')} - {format(bEnd, 'HH:mm')}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <strong>Mục đích:</strong> {b.purpose} ({b.attendees} người)
                                                </div>
                                                {b.reject_reason && <div className="text-sm text-red-600 mt-1"><strong>Lý do từ chối:</strong> {b.reject_reason}</div>}
                                                {b.meeting_link && <div className="text-sm text-blue-600 mt-1"><a href={b.meeting_link} target="_blank" rel="noreferrer" className="underline">Link cuộc họp</a></div>}
                                            </div>
                                            
                                            {filter === 'upcoming' && ['cho_duyet', 'da_duyet'].includes(b.status) && (
                                                <button 
                                                    onClick={() => handleCancel(b.id)}
                                                    className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
                                                >
                                                    Hủy lượt đặt
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
