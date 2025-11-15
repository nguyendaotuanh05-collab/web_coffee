// Ví dụ về logic tạo VNPAY URL và Checksum (Sử dụng Node.js)

const crypto = require('crypto');

// ... (Các biến cấu hình: vnp_TmnCode, vnp_HashSecret, vnp_ReturnUrl) ...

// Hàm tạo URL VNPAY
function createPaymentUrl(amount, orderId) {
    // 1. Khởi tạo các tham số cần thiết
    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_TmnCode: vnp_TmnCode,
        vnp_Command: 'pay',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: 'Thanh toán don hang ' + orderId,
        vnp_OrderType: 'other', // Hoặc web
        vnp_Amount: amount * 100, // VNPAY dùng đơn vị xu (cents), phải nhân 100
        vnp_CurrCode: 'VND',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: vnp_ReturnUrl,
        vnp_IpAddr: '127.0.0.1', // Nên lấy IP thực của khách hàng
        vnp_CreateDate: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14),
        vnp_ExpireDate: new Date(Date.now() + 15 * 60000).toISOString().replace(/[^0-9]/g, '').slice(0, 14), // Hết hạn sau 15 phút
    };

    // 2. Sắp xếp tham số theo thứ tự bảng chữ cái
    vnp_Params = sortObject(vnp_Params); // Hàm sortObject() cần được định nghĩa

    // 3. Nối tham số thành chuỗi rawData
    const signData = vnp_HashSecret + querystring.stringify(vnp_Params, { encode: false });

    // 4. Tạo mã Hash HMAC SHA512
    const secureHash = crypto.createHmac('sha512', vnp_HashSecret)
                            .update(signData)
                            .digest('hex');

    // 5. Thêm hash vào params và tạo URL hoàn chỉnh
    vnp_Params['vnp_SecureHash'] = secureHash;
    const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html' + '?' + querystring.stringify(vnp_Params, { encode: true });
    
    return vnpUrl;
}
