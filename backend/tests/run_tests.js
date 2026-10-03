const { spawn } = require('child_process');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('--- KHỞI ĐỘNG SERVER ---');
    const server = spawn('node', ['server.js'], { stdio: 'inherit' });
    
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

    } catch (err) {
        console.error('Lỗi khi chạy test:', err);
    } finally {
        console.log('\\n--- TỔNG KẾT ---');
        console.table(results);
        server.kill();
        process.exit(0);
    }
}

runTests();
