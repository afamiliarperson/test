import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { Users, MapPin, Monitor, Filter } from 'lucide-react';

const SearchRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [capacity, setCapacity] = useState('');
    const [type, setType] = useState('');
    const [building, setBuilding] = useState('');

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (capacity) params.append('capacity', capacity);
            if (type) params.append('type', type);
            if (building) params.append('building', building);

            const res = await api.get(`/rooms?${params.toString()}`);
            setRooms(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách phòng:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [capacity, type, building]);

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 bg-white p-5 rounded-lg shadow h-fit">
                <h3 className="font-bold text-lg mb-4 flex items-center"><Filter size={20} className="mr-2"/> Bộ lọc</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                        <select className="w-full border rounded p-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
                            <option value="">Tất cả</option>
                            <option value="nhom">Phòng họp nhóm</option>
                            <option value="truc_tuyen">Phòng trực tuyến</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa tối thiểu</label>
                        <input type="number" className="w-full border rounded p-2 text-sm" placeholder="VD: 5" value={capacity} onChange={e => setCapacity(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà</label>
                        <select className="w-full border rounded p-2 text-sm" value={building} onChange={e => setBuilding(e.target.value)}>
                            <option value="">Tất cả</option>
                            <option value="Tòa A">Tòa A</option>
                            <option value="Tòa B">Tòa B</option>
                            <option value="Tòa C">Tòa C</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">Danh sách phòng ({rooms.length})</h2>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                ) : rooms.length === 0 ? (
                    <div className="bg-white p-10 rounded-lg shadow text-center text-gray-500">
                        Không tìm thấy phòng nào phù hợp với bộ lọc.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {rooms.map(room => (
                            <div key={room.id} className="bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-school-blue-700">{room.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${room.status === 'hoat_dong' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {room.status === 'hoat_dong' ? 'Hoạt động' : 'Bảo trì'}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center"><Users size={16} className="mr-2"/> Sức chứa: {room.capacity} người</div>
                                    <div className="flex items-center"><MapPin size={16} className="mr-2"/> Vị trí: {room.type === 'truc_tuyen' ? 'Trực tuyến' : `${room.building} - Tầng ${room.floor}`}</div>
                                    <div className="flex items-start"><Monitor size={16} className="mr-2 mt-0.5 min-w-[16px]"/> Thiết bị: {room.equipment?.map(e => e.name).join(', ') || 'Không có'}</div>
                                </div>
                                <Link 
                                    to={`/rooms/${room.id}`}
                                    className="block w-full text-center bg-school-blue-50 text-school-blue-600 hover:bg-school-blue-600 hover:text-white font-medium py-2 rounded transition"
                                >
                                    Xem chi tiết & Đặt phòng
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchRooms;
