import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { Edit, Trash2, Plus } from 'lucide-react';

const ManageRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Form modal state
    const [showModal, setShowModal] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '', type: 'nhom', building: '', floor: '', capacity: 10,
        description: '', allowed_roles: 'sinh_vien,giang_vien', status: 'hoat_dong', equipments: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, eqRes] = await Promise.all([
                api.get('/rooms?all=true'),
                api.get('/rooms/equipments')
            ]);
            setRooms(roomsRes.data);
            setEquipments(eqRes.data);
        } catch (err) {
            toast.error('Lỗi tải dữ liệu phòng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const displayedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenModal = (room = null) => {
        if (room) {
            setCurrentRoom(room.id);
            setFormData({
                name: room.name, type: room.type, building: room.building, floor: room.floor,
                capacity: room.capacity, description: room.description || '', allowed_roles: room.allowed_roles,
                status: room.status, equipments: room.equipment?.map(e => e.id) || []
            });
        } else {
            setCurrentRoom(null);
            setFormData({
                name: '', type: 'nhom', building: '', floor: '', capacity: 10,
                description: '', allowed_roles: 'sinh_vien,giang_vien', status: 'hoat_dong', equipments: []
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentRoom) {
                await api.put(`/rooms/${currentRoom}`, formData);
                toast.success('Cập nhật phòng thành công');
            } else {
                await api.post('/rooms', formData);
                toast.success('Thêm phòng thành công');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Lỗi lưu dữ liệu');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa phòng này không?')) return;
        try {
            const res = await api.delete(`/rooms/${id}`);
            toast.success(res.data.message);
            fetchData();
        } catch (err) {
            toast.error('Lỗi khi xóa phòng');
        }
    };

    const toggleEq = (eqId) => {
        setFormData(prev => ({
            ...prev,
            equipments: prev.equipments.includes(eqId) 
                ? prev.equipments.filter(id => id !== eqId) 
                : [...prev.equipments, eqId]
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold">Quản lý phòng</h2>
                <button onClick={() => handleOpenModal()} className="bg-school-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-school-blue-700">
                    <Plus size={18} className="mr-2" /> Thêm phòng mới
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <div className="mb-4">
                    <input type="text" placeholder="Tìm kiếm theo tên phòng..." className="w-full md:w-1/3 border rounded p-2" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>

                {loading ? <div className="text-center py-10">Đang tải...</div> : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên phòng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại / Sức chứa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vị trí</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {displayedRooms.map(r => (
                                        <tr key={r.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{r.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.type === 'nhom' ? 'Họp nhóm' : 'Trực tuyến'} - {r.capacity} người</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.building} Tầng {r.floor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'hoat_dong' ? 'bg-green-100 text-green-800' : r.status === 'bao_tri' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {r.status === 'hoat_dong' ? 'Hoạt động' : r.status === 'bao_tri' ? 'Bảo trì' : 'Ngừng SD'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleOpenModal(r)} className="text-school-blue-600 hover:text-school-blue-900 mr-4"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedRooms.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Không tìm thấy dữ liệu.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
                            <span className="text-sm text-gray-600">Trang {currentPage} / {totalPages || 1}</span>
                            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">{currentRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}</h3>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tên phòng *</label>
                                        <input type="text" required className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Loại phòng</label>
                                        <select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option value="nhom">Họp nhóm</option>
                                            <option value="truc_tuyen">Trực tuyến</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tòa nhà</label>
                                        <input type="text" className="w-full border rounded p-2" value={formData.building} onChange={e => setFormData({...formData, building: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tầng</label>
                                        <input type="number" className="w-full border rounded p-2" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Sức chứa *</label>
                                        <input type="number" required className="w-full border rounded p-2" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Đối tượng cho phép</label>
                                    <select className="w-full border rounded p-2" value={formData.allowed_roles} onChange={e => setFormData({...formData, allowed_roles: e.target.value})}>
                                        <option value="sinh_vien,giang_vien">Sinh viên, Giảng viên</option>
                                        <option value="giang_vien">Chỉ Giảng viên</option>
                                    </select>
                                </div>

                                {currentRoom && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                        <select className="w-full border rounded p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                            <option value="hoat_dong">Hoạt động</option>
                                            <option value="bao_tri">Bảo trì</option>
                                            <option value="ngung_su_dung">Ngừng sử dụng</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1">Thiết bị</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {equipments.map(eq => (
                                            <label key={eq.id} className="flex items-center space-x-2">
                                                <input type="checkbox" checked={formData.equipments.includes(eq.id)} onChange={() => toggleEq(eq.id)} />
                                                <span className="text-sm">{eq.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                                    <textarea className="w-full border rounded p-2" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                                    <button type="submit" className="px-4 py-2 bg-school-blue-600 text-white rounded hover:bg-school-blue-700">Lưu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRooms;
