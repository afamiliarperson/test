import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Users, DoorOpen, Calendar, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            
            const res = await api.get(`/stats/dashboard?${params.toString()}`);
            setStats(res.data);
        } catch (err) {
            toast.error('Lỗi tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [startDate, endDate]);

    const handleExportCSV = () => {
        if (!stats) return;
        const csvRows = [];
        csvRows.push('Ngày,Số lượt đặt');
        stats.bookingsPerDay.forEach(item => {
            csvRows.push(`${item.date},${item.count}`);
        });
        
        const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thong_ke_${format(new Date(), 'yyyyMMdd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading && !stats) return <div className="text-center py-10">Đang tải...</div>;
    if (!stats) return null;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 md:mb-0">Thống kê hệ thống</h2>
                <div className="flex space-x-3 items-center">
                    <input type="date" className="border rounded p-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>-</span>
                    <input type="date" className="border rounded p-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700">
                        <Download size={18} className="mr-2" /> Xuất CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4"><DoorOpen size={24}/></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng phòng</p>
                            <p className="text-2xl font-bold">{stats.totalRooms}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4"><Calendar size={24}/></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tổng lượt đặt</p>
                            <p className="text-2xl font-bold">{stats.totalBookings}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4"><Users size={24}/></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Lượt đặt hôm nay</p>
                            <p className="text-2xl font-bold">{stats.todayBookings}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4"><XCircle size={24}/></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tỉ lệ hủy</p>
                            <p className="text-2xl font-bold">{stats.cancelRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">Lượt đặt theo ngày</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.bookingsPerDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#3b82f6" name="Lượt đặt" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">Tần suất sử dụng phòng</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.roomUsage} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <RechartsTooltip />
                                <Bar dataKey="usage_count" fill="#10b981" name="Lượt đặt" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">Khung giờ cao điểm</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.peakHours}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#f59e0b" name="Lượt đặt" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">Lượt đặt theo vai trò</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.bookingsByRole} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={100} label>
                                    {stats.bookingsByRole.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
