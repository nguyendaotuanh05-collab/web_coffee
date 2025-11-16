const { VNPay } = require('vnpay/vnpay'); // Hoặc require('vnpay')
const moment = require('moment'); // Giữ lại moment nếu cần tạo ngày tháng thủ công

// ------------------------------------------------------------------
// Lấy cấu hình từ Netlify Environment Variables
// ------------------------------------------------------------------
const tmnCode = process.env.VNP_TMNCODE;
const secureSecret = process.env.VNP_HASHSECRET;
const vnpayHost = process.env.VNP_URL.replace('/paymentv2/vpcpay.html', ''); // Lấy Host URL gốc
const returnUrl = process.env.VNP_RETURN_URL;

// Khởi tạo VNPay (Cần xử lý try/catch nếu các biến trên bị thiếu)
try {
    const vnpay = new VNPay({
        tmnCode: tmnCode,
        secureSecret: secureSecret,
        vnpayHost: vnpayHost, // Chỉ cần host name (ví dụ: https://sandbox.vnpayment.vn)
        testMode: true, 
    });
} catch (error) {
    console.error("VNPAY INITIALIZATION ERROR:", error);
}

// HÀM XỬ LÝ CHÍNH CỦA NETLIFY FUNCTION
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Kiểm tra khởi tạo
    if (!vnpay) {
        return { statusCode: 500, body: JSON.stringify({ message: "VNPAY initialization failed. Check ENV variables." }) };
    }

    try {
        const { amount, orderId, orderInfo } = JSON.parse(event.body);
        const ipAddr = event.headers['x-forwarded-for'] || '';
        
        // Sử dụng hàm buildPaymentUrl của thư viện
        const paymentUrl = vnpay.buildPaymentUrl({
            vnp_Amount: amount * 100, // Thư viện vẫn yêu cầu Cent
            vnp_IpAddr: ipAddr,
            vnp_ReturnUrl: returnUrl,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`,
        });

        // Trả về URL cho Frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ vnpUrl: paymentUrl }),
        };

    } catch (error) {
        console.error("VNPAY CREATE ERROR (LIB):", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Lỗi tạo URL VNPAY bằng thư viện.", error: error.message }),
        };
    }
};
