// /netlify/functions/vnpay-ipn.js

const crypto = require('crypto');
const querystring = require('querystring');
const { MongoClient } = require('mongodb'); // Ví dụ: sử dụng MongoDB để kết nối DB

// 1. CẤU HÌNH VNPAY VÀ DATABASE
const vnp_HashSecret = process.env.VNPAY_HASH_SECRET; // Nên dùng biến môi trường
const mongo_uri = process.env.MONGODB_URI;

// HÀM XỬ LÝ CHÍNH KHI VNPAY GỌI ĐẾN
exports.handler = async (event) => {
    // Chỉ chấp nhận GET request từ VNPAY
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Lấy tất cả tham số từ URL
    const vnp_Params = event.queryStringParameters;
    
    // --- BẮT ĐẦU QUY TRÌNH XÁC MINH (VALIDATION) ---

    // 2. Tách Mã Hash Bảo mật (SecureHash)
    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash']; // Xóa hash cũ để tạo hash mới

    // 3. Sắp xếp lại tham số và Tạo lại Mã Hash
    const sortedParams = sortObject(vnp_Params); // Bạn cần định nghĩa hàm sortObject()
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Tạo hash mới để so sánh
    const newSecureHash = crypto.createHmac('sha512', vnp_HashSecret)
                                .update(signData)
                                .digest('hex');

    // 4. XÁC MINH CHỮ KÝ BẢO MẬT
    if (secureHash !== newSecureHash) {
        // Trả về mã lỗi: Sai chữ ký bảo mật
        return { statusCode: 200, body: JSON.stringify({ RspCode: '97', Message: 'Invalid signature' }) };
    }
    
    // --- XÁC MINH THÀNH CÔNG, BẮT ĐẦU CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ---
    
    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];
    let db;

    try {
        // 5. Kết nối Database
        db = await MongoClient.connect(mongo_uri);
        const ordersCollection = db.db('your_db_name').collection('orders');
        
        // 6. TÌM KIẾM ĐƠN HÀNG TRONG HỆ THỐNG
        const order = await ordersCollection.findOne({ order_id: orderId });
        
        if (!order) {
            // Đơn hàng không tồn tại
            return { statusCode: 200, body: JSON.stringify({ RspCode: '01', Message: 'Order not found' }) };
        }

        if (order.status === 'success') {
            // Đơn hàng đã được xử lý rồi (Tránh xử lý trùng lặp)
            return { statusCode: 200, body: JSON.stringify({ RspCode: '02', Message: 'Order already confirmed' }) };
        }

        // 7. CẬP NHẬT TRẠNG THÁI DỰA TRÊN MÃ PHẢN HỒI
        if (responseCode === '00') {
            // Thanh toán thành công!
            await ordersCollection.updateOne(
                { order_id: orderId },
                { $set: { status: 'success', payment_date: new Date() } }
            );

            // 8. TRẢ VỀ PHẢN HỒI THÀNH CÔNG CHO VNPAY
            return { statusCode: 200, body: JSON.stringify({ RspCode: '00', Message: 'Confirm success' }) };
        } else {
            // Thanh toán thất bại hoặc hủy bỏ
            await ordersCollection.updateOne(
                { order_id: orderId },
                { $set: { status: 'failed', vnp_code: responseCode } }
            );

            // 8. TRẢ VỀ PHẢN HỒI THÀNH CÔNG CHO VNPAY (VNPAY chỉ quan tâm nhận được phản hồi)
            return { statusCode: 200, body: JSON.stringify({ RspCode: '00', Message: 'Confirm success' }) };
        }

    } catch (error) {
        console.error("Database or processing error:", error);
        // Trả về mã lỗi: Lỗi hệ thống/DB (VNPAY sẽ thử gửi lại sau)
        return { statusCode: 200, body: JSON.stringify({ RspCode: '99', Message: 'System error' }) };
    } finally {
        if (db) db.close();
    }
};

// Hàm phụ trợ để sắp xếp tham số (Cần thiết cho VNPAY)
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}
