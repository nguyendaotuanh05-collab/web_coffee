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

// Hàm xử lý chính
exports.handler = async (event) => {
    // 1. Kiểm tra phương thức HTTP
    if (event.httpMethod !== 'GET') {
        // Chỉ trả về JSON cho các phương thức không phải GET (chủ yếu là IPN server-to-server)
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    // Kiểm tra khởi tạo
    if (!vnpay) {
        return { statusCode: 500, body: JSON.stringify({ RspCode: '99', Message: 'System initialization error' }) };
    }

    try {
        const query = event.queryStringParameters;
        
        // Lấy URL gốc của website (ví dụ: https://23dh.netlify.app/)
        // Dùng header.host để lấy domain hiện tại
        const siteUrl = event.headers.host ? `https://${event.headers.host}` : 'https://23dh.netlify.app';

        // Sử dụng hàm verifyReturnUrl của thư viện để xác thực cả IPN
        const verify = vnpay.verifyReturnUrl(query); 
        
        // Phản hồi cho VNPAY Server (IPN)
        // Lưu ý: Hàm này dùng chung cho cả RETURN và IPN. 
        // Theo yêu cầu của VNPAY, nếu xác thực Hash đúng, phải trả về JSON {RspCode: '00'} cho server của họ
        // Tuy nhiên, đối với RETURN URL (trình duyệt), ta cần REDIRECT

        if (verify.isSuccess) {
            
            // **Quan trọng:** Gửi phản hồi JSON '00' trước cho VNPAY Server (IPN)
            // Vì đây là RETURN URL (trình duyệt), ta sẽ chuyển hướng (redirect)
            
            if (query.vnp_ResponseCode === '00') {
                // Giao dịch thành công, chuyển hướng người dùng đến trang kết quả
                // VNPAY yêu cầu trả về JSON 00 cho IPN, nhưng vì đây là RETURN (trình duyệt), ta ưu tiên chuyển hướng.
                return {
                    statusCode: 302, // Mã chuyển hướng (Redirect)
                    headers: {
                        // Chuyển hướng đến ketqua.html và đính kèm thông tin
                        'Location': `${siteUrl}/ketqua.html?status=success&orderId=${query.vnp_TxnRef}&amount=${query.vnp_Amount / 100}`,
                    },
                    body: '' // Body rỗng cho redirect
                };
            } else {
                // Giao dịch thất bại (Hash đúng nhưng ngân hàng từ chối)
                return {
                    statusCode: 302,
