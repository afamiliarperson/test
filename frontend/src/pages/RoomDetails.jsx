import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axios';
import { Users, MapPin, Monitor, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';

const RoomDetails = () => {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await api.get(`/rooms/${id}`);
                setRoom(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    if (loading) return <div className="text-center py-10">Đang tải...</div>;
    if (!room) return <div className="text-center py-10">Không tìm thấy phòng.</div>;

    const canBook = room.status === 'hoat_dong' && (room.allowed_roles.includes(user.role) || user.role === 'admin');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{room.name}</h1>
                        <p className="text-gray-500 mt-1">{room.description}</p>
                    </div>
                    {canBook ? (
                        <Link to={`/rooms/${room.id}/book`} className="bg-school-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-school-blue-700">
                            Đặt phòng này
                        </Link>
                    ) : (
                        <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium">Không thể đặt phòng</span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">Thông tin</h3>
                        <div className="flex items-center"><Users className="mr-3 text-gray-400"/>Sức chứa: <strong>{room.capacity} người</strong></div>
                        <div className="flex items-center"><MapPin className="mr-3 text-gray-400"/>Vị trí: <strong>{room.type === 'truc_tuyen' ? 'Phòng trực tuyến' : `${room.building} - Tầng ${room.floor}`}</strong></div>
                        <div className="flex items-center"><CheckCircle className="mr-3 text-gray-400"/>Đối tượng: <strong>{room.allowed_roles.includes('sinh_vien') ? 'SV, GV' : 'Chỉ GV'}</strong></div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">Thiết bị có sẵn</h3>
                        <ul className="space-y-2">
                            {room.equipment?.map(eq => (
                                <li key={eq.id} className="flex items-center"><Monitor className="mr-3 text-school-blue-500" size={18}/> {eq.name}</li>
                            ))}
                            {(!room.equipment || room.equipment.length === 0) && <li className="text-gray-500">Không có thiết bị đặc biệt.</li>}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg border-b pb-2 mb-4 flex items-center"><Clock className="mr-2"/> Lịch đã được đặt sắp tới</h3>
                {room.upcoming_bookings?.length > 0 ? (
                    <ul className="space-y-3">
                        {room.upcoming_bookings.map((b, i) => (
                            <li key={i} className="flex items-center bg-gray-50 p-3 rounded border border-gray-100">
                                <span className={`w-3 h-3 rounded-full mr-3 ${b.status === 'da_duyet' ? 'bg-green-500' : 'bg-yellow-400'}`}></span>
                                <span className="font-medium">{format(new Date(b.start_time), 'dd/MM/yyyy')}</span>
                                <span className="mx-2 text-gray-400">|</span>
                                <span>{format(new Date(b.start_time), 'HH:mm')} - {format(new Date(b.end_time), 'HH:mm')}</span>
                                <span className="ml-auto text-sm text-gray-500 italic">{b.status === 'da_duyet' ? 'Đã duyệt' : 'Chờ duyệt'}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-500 italic text-center py-4">Hiện chưa có lịch đặt nào sắp tới.</div>
                )}
            </div>
        </div>
    );
};

export default RoomDetails;
