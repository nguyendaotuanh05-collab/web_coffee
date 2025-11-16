const { VNPay } = require('vnpay/vnpay');

// Lấy cấu hình từ Netlify Environment Variables
const tmnCode = process.env.VNP_TMNCODE;
const secureSecret = process.env.VNP_HASHSECRET;
// Lấy Host name từ VNP_URL, ví dụ: https://sandbox.vnpayment.vn
const vnpayHost = process.env.VNP_URL ? process.env.VNP_URL.replace('/paymentv2/vpcpay.html', '') : ''; 

let vnpay;
try {
    // Khởi tạo VNPay
    vnpay = new VNPay({
        tmnCode: tmnCode,
        secureSecret: secureSecret,
        vnpayHost: vnpayHost,
        testMode: true, 
    });
} catch (error) {
    console.error("VNPAY IPN INITIALIZATION ERROR:", error);
}


exports.handler = async (event) => {
    // 1. Kiểm tra phương thức HTTP
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    // Kiểm tra khởi tạo
    if (!vnpay) {
        return { statusCode: 500, body: JSON.stringify({ RspCode: '99', Message: 'System initialization error' }) };
    }

    try {
        const query = event.queryStringParameters;
        // Sử dụng hàm verifyReturnUrl của thư viện để xác thực cả IPN
        const verify = vnpay.verifyReturnUrl(query); 
        
        // Trả về RspCode 00 cho VNPAY để xác nhận đã nhận được kết quả (theo yêu cầu của VNPAY)
        if (verify.isSuccess) {
             // **THỰC HIỆN CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH CÔNG TẠI ĐÂY**
             // Chỉ cập nhật trạng thái nếu vnp_ResponseCode là '00' (Thành công)
             return { statusCode: 200, body: JSON.stringify({ RspCode: '00', Message: 'Confirm success' }) };
        } else {
            // Hash sai (RspCode 97) hoặc lỗi giao dịch khác
            return { statusCode: 200, body: JSON.stringify({ RspCode: '97', Message: verify.message }) };
        }

    } catch (error) {
        console.error("VNPAY IPN ERROR:", error);
        return { statusCode: 500, body: JSON.stringify({ RspCode: '99', Message: 'System error' }) };
    }
};