const { spawn } = require('child_process');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Tạo DB tạm
const dbFile = path.resolve(__dirname, 'temp_test.sqlite');
if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
const db = new Database(dbFile);
const schema = fs.readFileSync(path.resolve(__dirname, '../../database/schema.sql'), 'utf8');
const seed = fs.readFileSync(path.resolve(__dirname, '../../database/seed.sql'), 'utf8');
db.exec(schema);
db.exec(seed);
db.close();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('--- KHỞI ĐỘNG SERVER ---');
    const server = spawn('node', ['server.js'], { 
        stdio: 'inherit',
        env: {
            ...process.env,
            JWT_SECRET: 'test_secret_key_12345678',
            DB_FILE: 'tests/temp_test.sqlite'
        }
    });
    
    // Đợi server khởi động
    await sleep(2000);
    const BASE_URL = 'http://localhost:5000/api';
    let results = [];
    
    try {
        console.log('\\n--- BÀI TEST 1: ĐĂNG NHẬP 3 TÀI KHOẢN ---');
        let tokens = {};
        for (const email of ['admin@demo.com', 'gv@demo.com', 'sv@demo.com']) {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: '12345678' })
            });
            const data = await res.json();
            if (res.status === 200 && data.token) {
                tokens[email] = data.token;
                console.log(`[ĐẠT] Đăng nhập thành công: ${email}`);
                results.push({ test: `Đăng nhập ${email}`, status: 'ĐẠT' });
            } else {
                console.log(`[KHÔNG ĐẠT] Đăng nhập thất bại: ${email}`, data);
                results.push({ test: `Đăng nhập ${email}`, status: 'KHÔNG ĐẠT' });
            }
        }

        console.log('\\n--- BÀI TEST 2: SINH VIÊN GỌI API ADMIN BỊ CHẶN ---');
        const svToken = tokens['sv@demo.com'];
        const resAdmin = await fetch(`${BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${svToken}` }
        });
        if (resAdmin.status === 403) {
            console.log(`[ĐẠT] Sinh viên bị chặn (403) khi gọi API Admin.`);
            results.push({ test: 'Phân quyền API Admin', status: 'ĐẠT' });
        } else {
            console.log(`[KHÔNG ĐẠT] Lỗi phân quyền, HTTP status: ${resAdmin.status}`);
            results.push({ test: 'Phân quyền API Admin', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 3: ĐẶT PHÒNG HỢP LỆ THÀNH CÔNG ---');
        // Sinh viên đặt phòng số 1 vào 11 ngày sau
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 11);
        tomorrow.setHours(9, 0, 0, 0); // 09:00
        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(11, 0, 0, 0); // 11:00

        const bookingData = {
            room_id: 1,
            start_time: tomorrow.toISOString(),
            end_time: tomorrowEnd.toISOString(),
            attendees: 5,
            purpose: 'Test đặt phòng hợp lệ',
            note: ''
        };

        const resBook = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${svToken}`
            },
            body: JSON.stringify(bookingData)
        });
        const dataBook = await resBook.json();
        let bookingId = null;
        if (resBook.status === 201) {
            bookingId = dataBook.bookingId;
            console.log(`[ĐẠT] Đặt phòng thành công, ID: ${bookingId}`);
            results.push({ test: 'Đặt phòng hợp lệ', status: 'ĐẠT' });
        } else {
            console.log(`[KHÔNG ĐẠT] Đặt phòng thất bại`, dataBook);
            results.push({ test: 'Đặt phòng hợp lệ', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 4: ĐẶT TRÙNG LỊCH BỊ TỪ CHỐI ---');
        const gvToken = tokens['gv@demo.com'];
        const resOverlap = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gvToken}`
            },
            body: JSON.stringify(bookingData)
        });
        const dataOverlap = await resOverlap.json();
        if (resOverlap.status === 409 && dataOverlap.error.includes('đã bị đặt')) {
            console.log(`[ĐẠT] Trùng lịch bị từ chối đúng logic.`);
            console.log(`Gợi ý trả về: ${dataOverlap.suggestions.length} phòng`);
            results.push({ test: 'Kiểm tra trùng lịch', status: 'ĐẠT' });
        } else {
            console.log(`[KHÔNG ĐẠT] Trùng lịch không bị bắt hoặc sai mã lỗi`, dataOverlap);
            results.push({ test: 'Kiểm tra trùng lịch', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 5: HỦY LỊCH TRƯỚC GIỜ BẮT ĐẦU ---');
        if (bookingId) {
            const resCancel = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${svToken}` }
            });
            if (resCancel.status === 200) {
                console.log(`[ĐẠT] Hủy lịch thành công.`);
                results.push({ test: 'Hủy lịch đặt', status: 'ĐẠT' });
            } else {
                const cancelData = await resCancel.json();
                console.log(`[KHÔNG ĐẠT] Hủy lịch thất bại`, cancelData);
                results.push({ test: 'Hủy lịch đặt', status: 'KHÔNG ĐẠT' });
            }
        }

        console.log('\\n--- BÀI TEST 6: SINH VIÊN ĐẶT LƯỢT THỨ 3/NGÀY BỊ TỪ CHỐI ---');
        const d = new Date(); d.setDate(d.getDate() + 20);
        d.setHours(8,0,0,0); const s1 = new Date(d);
        d.setHours(10,0,0,0); const e1 = new Date(d);
        d.setHours(11,0,0,0); const s2 = new Date(d);
        d.setHours(13,0,0,0); const e2 = new Date(d);
        d.setHours(14,0,0,0); const s3 = new Date(d);
        d.setHours(16,0,0,0); const e3 = new Date(d);
        
        await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${svToken}` },
            body: JSON.stringify({ room_id: 1, start_time: s1.toISOString(), end_time: e1.toISOString(), attendees: 2, purpose: 'Test' })
        });
        await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${svToken}` },
            body: JSON.stringify({ room_id: 2, start_time: s2.toISOString(), end_time: e2.toISOString(), attendees: 2, purpose: 'Test' })
        });
        
        const resTest6 = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${svToken}` },
            body: JSON.stringify({ room_id: 3, start_time: s3.toISOString(), end_time: e3.toISOString(), attendees: 2, purpose: 'Test' })
        });
        if (resTest6.status === 400 && (await resTest6.json()).error.includes('tối đa 2 lượt')) {
            results.push({ test: 'Giới hạn 2 lượt/ngày', status: 'ĐẠT' });
        } else {
            results.push({ test: 'Giới hạn 2 lượt/ngày', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 7: ĐẶT QUÁ 3 GIỜ ---');
        const longEnd = new Date(s3); longEnd.setHours(longEnd.getHours() + 4); // 4 tiếng
        const resTest7 = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gvToken}` },
            body: JSON.stringify({ room_id: 3, start_time: s3.toISOString(), end_time: longEnd.toISOString(), attendees: 2, purpose: 'Test' })
        });
        if (resTest7.status === 400 && (await resTest7.json()).error.includes('tối đa 3 giờ')) {
            results.push({ test: 'Giới hạn 3 giờ', status: 'ĐẠT' });
        } else {
            results.push({ test: 'Giới hạn 3 giờ', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 8: ĐẶT NGOÀI GIỜ (TRƯỚC 7H) ---');
        const earlyStart = new Date(s3); earlyStart.setHours(6,0,0,0);
        const earlyEnd = new Date(s3); earlyEnd.setHours(8,0,0,0);
        const resTest8 = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gvToken}` },
            body: JSON.stringify({ room_id: 3, start_time: earlyStart.toISOString(), end_time: earlyEnd.toISOString(), attendees: 2, purpose: 'Test' })
        });
        if (resTest8.status === 400 && (await resTest8.json()).error.includes('07:00 đến 21:00')) {
            results.push({ test: 'Giới hạn giờ mở cửa', status: 'ĐẠT' });
        } else {
            results.push({ test: 'Giới hạn giờ mở cửa', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 9: SINH VIÊN ĐẶT PHÒNG GIẢNG VIÊN ---');
        const gvRoomStart = new Date(s3); gvRoomStart.setHours(9,0,0,0);
        const gvRoomEnd = new Date(s3); gvRoomEnd.setHours(11,0,0,0);
        const resTest9 = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${svToken}` },
            body: JSON.stringify({ room_id: 4, start_time: gvRoomStart.toISOString(), end_time: gvRoomEnd.toISOString(), attendees: 2, purpose: 'Test' })
        });
        if (resTest9.status === 403 && (await resTest9.json()).error.includes('không được phép')) {
            results.push({ test: 'Quyền đặt phòng Giảng viên', status: 'ĐẠT' });
        } else {
            results.push({ test: 'Quyền đặt phòng Giảng viên', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 10: ĐẶT VÀO QUÁ KHỨ ---');
        const pastStart = new Date(); pastStart.setDate(pastStart.getDate() - 1);
        const pastEnd = new Date(pastStart); pastEnd.setHours(pastEnd.getHours() + 2);
        const resTest10 = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gvToken}` },
            body: JSON.stringify({ room_id: 3, start_time: pastStart.toISOString(), end_time: pastEnd.toISOString(), attendees: 2, purpose: 'Test' })
        });
        if (resTest10.status === 400 && (await resTest10.json()).error.includes('quá khứ')) {
            results.push({ test: 'Giới hạn thời gian quá khứ', status: 'ĐẠT' });
        } else {
            results.push({ test: 'Giới hạn thời gian quá khứ', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 11: KIỂM TRA API THỐNG KÊ ---');
        const adminToken = tokens['admin@demo.com'];
        const resTest11 = await fetch(`${BASE_URL}/stats/dashboard`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const dataTest11 = await resTest11.json();
        if (resTest11.status === 200 && dataTest11.totalRooms !== undefined && dataTest11.revenue === undefined) {
            results.push({ test: 'API Thống kê hợp lệ', status: 'ĐẠT' });
        } else {
            results.push({ test: 'API Thống kê hợp lệ', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 12: KIỂM TRA HIỂN THỊ LỊCH ĐẶT MỚI TRONG TAB SẮP TỚI ---');
        // Tạo một lượt đặt ngày mai
        const tomorrowTest = new Date(); tomorrowTest.setDate(tomorrowTest.getDate() + 1);
        tomorrowTest.setHours(16,0,0,0); const ttStart = new Date(tomorrowTest);
        tomorrowTest.setHours(18,0,0,0); const ttEnd = new Date(tomorrowTest);
        
        const test12Post = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gvToken}` },
            body: JSON.stringify({ room_id: 1, start_time: ttStart.toISOString(), end_time: ttEnd.toISOString(), attendees: 2, purpose: 'Test UI' })
        });

        // Gọi getMyBookings với filter upcoming
        const resTest12 = await fetch(`${BASE_URL}/bookings/me?filter=upcoming`, {
            headers: { 'Authorization': `Bearer ${gvToken}` }
        });
        const dataTest12 = await resTest12.json();
        
        // Kiểm tra xem lượt đặt vừa tạo có nằm trong mảng dataTest12 không
        const found = dataTest12.find(b => b.room_id === 1 && b.purpose === 'Test UI');
        if (resTest12.status === 200 && found) {
            results.push({ test: 'Hiển thị đúng trong tab Sắp tới', status: 'ĐẠT' });
        } else {
            results.push({ test: 'Hiển thị đúng trong tab Sắp tới', status: 'KHÔNG ĐẠT' });
        }

        console.log('\\n--- BÀI TEST 13: KIỂM TRA API ADMIN (STATS, USERS, EQUIPMENTS) ---');
        const resStats = await fetch(`${BASE_URL}/stats/dashboard?startDate=2020-01-01&endDate=2030-01-01`, { headers: { 'Authorization': `Bearer ${adminToken}` }});
        const dataStats = await resStats.json();
        
        const resUsers = await fetch(`${BASE_URL}/users?role=sinh_vien`, { headers: { 'Authorization': `Bearer ${adminToken}` }});
        const dataUsers = await resUsers.json();
        
        const resEq = await fetch(`${BASE_URL}/rooms/equipments`, { headers: { 'Authorization': `Bearer ${adminToken}` }});
        const dataEq = await resEq.json();

        if (resStats.status === 200 && dataStats.bookingsByRole && Array.isArray(dataUsers) && Array.isArray(dataEq)) {
            results.push({ test: 'API Admin hoạt động đúng (Stats, Users, Equipments)', status: 'ĐẠT' });
        } else {
            results.push({ test: 'API Admin hoạt động đúng (Stats, Users, Equipments)', status: 'KHÔNG ĐẠT' });
        }

    } catch (err) {
        console.error('Lỗi khi chạy test:', err);
    } finally {
        console.log('\\n--- TỔNG KẾT ---');
        console.table(results);
        server.kill();
        if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
        process.exit(0);
    }
}

runTests();
