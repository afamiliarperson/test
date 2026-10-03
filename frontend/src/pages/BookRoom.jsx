import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';

const BookRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [attendees, setAttendees] = useState('');
    const [purpose, setPurpose] = useState('');
    const [note, setNote] = useState('');
    const [link, setLink] = useState('');

    // Suggestions state
    const [overlapError, setOverlapError] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        api.get(`/rooms/${id}`).then(res => setRoom(res.data)).catch(console.error);
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOverlapError('');
        setSuggestions([]);
        setLoading(true);

        const startIso = new Date(`${date}T${startTime}:00`).toISOString();
        const endIso = new Date(`${date}T${endTime}:00`).toISOString();

        try {
            await api.post('/bookings', {
                room_id: id,
                start_time: startIso,
                end_time: endIso,
                attendees,
                purpose,
                note,
                meeting_link: link
            });
            toast.success('Đặt phòng thành công, vui lòng chờ duyệt.');
            navigate('/my-bookings');
        } catch (err) {
            const data = err.response?.data;
            if (data?.error?.includes('trùng') || data?.code === 'OVERLAP') {
                setOverlapError(data.error);
                if (data.suggestions) setSuggestions(data.suggestions);
            } else {
                toast.error(data?.error || 'Lỗi khi đặt phòng');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!room) return <div className="text-center py-10">Đang tải...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Đặt phòng: {room.name}</h2>
            
            {overlapError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <p className="font-bold mb-2">Không thể đặt phòng</p>
                    <p>{overlapError}</p>
                    {suggestions.length > 0 && (
                        <div className="mt-4">
                            <p className="font-medium mb-2">Gợi ý các phòng trống cùng thời gian:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(s => (
                                    <Link key={s.id} to={`/rooms/${s.id}/book`} onClick={() => setOverlapError('')} className="bg-white border border-red-200 px-3 py-1 rounded text-sm hover:bg-red-100 transition">
                                        {s.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày</label>
                        <input type="date" required className="mt-1 block w-full border rounded p-2" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giờ bắt đầu</label>
                        <input type="time" required className="mt-1 block w-full border rounded p-2" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giờ kết thúc</label>
                        <input type="time" required className="mt-1 block w-full border rounded p-2" value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số người tham gia</label>
                        <input type="number" required max={room.capacity} className="mt-1 block w-full border rounded p-2" value={attendees} onChange={e => setAttendees(e.target.value)} />
                        <span className="text-xs text-gray-500">Tối đa: {room.capacity}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mục đích</label>
                        {user.role === 'giang_vien' ? (
                            <select required className="mt-1 block w-full border rounded p-2" value={purpose} onChange={e => setPurpose(e.target.value)}>
                                <option value="">-- Chọn mục đích --</option>
                                <option value="Giảng dạy">Giảng dạy</option>
                                <option value="Họp nhóm">Họp nhóm</option>
                                <option value="Hướng dẫn sinh viên">Hướng dẫn sinh viên</option>
                                <option value="Hoạt động học thuật">Hoạt động học thuật</option>
                                <option value="Khác">Khác</option>
                            </select>
                        ) : (
                            <input type="text" required placeholder="VD: Học nhóm môn Công nghệ phần mềm" className="mt-1 block w-full border rounded p-2" value={purpose} onChange={e => setPurpose(e.target.value)} />
                        )}
                    </div>
                </div>

                {room.type === 'truc_tuyen' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link họp trực tuyến (Nếu có sẵn)</label>
                        <input type="url" placeholder="https://meet.google.com/..." className="mt-1 block w-full border rounded p-2" value={link} onChange={e => setLink(e.target.value)} />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú (Tùy chọn)</label>
                    <textarea rows="3" className="mt-1 block w-full border rounded p-2" value={note} onChange={e => setNote(e.target.value)}></textarea>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Hủy</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-school-blue-600 text-white rounded hover:bg-school-blue-700 disabled:opacity-50">
                        {loading ? 'Đang xử lý...' : 'Xác nhận Đặt phòng'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookRoom;
