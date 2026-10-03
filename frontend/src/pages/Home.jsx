import { Link } from 'react-router-dom';
import { Search, CalendarDays } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-8">
            <div className="bg-school-blue-700 rounded-2xl p-10 text-white text-center shadow-lg">
                <h1 className="text-4xl font-bold mb-4">Chào mừng đến với Hệ thống Đặt phòng</h1>
                <p className="text-lg text-school-blue-100 max-w-2xl mx-auto mb-8">
                    Tìm kiếm và đặt phòng học nhóm, phòng thảo luận, hoặc phòng họp trực tuyến một cách dễ dàng và nhanh chóng.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link to="/rooms" className="bg-white text-school-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center hover:bg-gray-100 transition">
                        <Search className="mr-2" size={20} />
                        Tìm phòng ngay
                    </Link>
                    <Link to="/my-bookings" className="bg-school-blue-600 border border-school-blue-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center hover:bg-school-blue-500 transition">
                        <CalendarDays className="mr-2" size={20} />
                        Lịch đặt của tôi
                    </Link>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Hướng dẫn sử dụng</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 text-school-blue-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">1</div>
                        <h3 className="text-lg font-semibold mb-2">Tìm kiếm phòng</h3>
                        <p className="text-gray-600">Sử dụng bộ lọc để tìm phòng có sức chứa và thiết bị phù hợp với nhu cầu của bạn.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 text-school-blue-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">2</div>
                        <h3 className="text-lg font-semibold mb-2">Chọn khung giờ</h3>
                        <p className="text-gray-600">Kiểm tra lịch trống của phòng và chọn khung giờ chưa có người đặt (Tối đa 3 giờ/lượt).</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 text-school-blue-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">3</div>
                        <h3 className="text-lg font-semibold mb-2">Chờ phê duyệt</h3>
                        <p className="text-gray-600">Hệ thống sẽ ghi nhận và Quản trị viên sẽ phê duyệt lịch đặt của bạn trong thời gian sớm nhất.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
