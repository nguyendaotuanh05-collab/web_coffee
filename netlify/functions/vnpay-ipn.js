const { VNPay } = require('vnpay/vnpay');

const tmnCode = process.env.VNP_TMNCODE;
const secureSecret = process.env.VNP_HASHSECRET;
const vnpayHost = process.env.VNP_URL.replace('/paymentv2/vpcpay.html', ''); 

// Khởi tạo VNPay
const vnpay = new VNPay({
    tmnCode: tmnCode,
    secureSecret: secureSecret,
    vnpayHost: vnpayHost,
    testMode: true, 
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const query = event.queryStringParameters;
        const verify = vnpay.verifyReturnUrl(query); // Dùng hàm verify chung cho IPN và Return URL
        
        // Trả về RspCode 00 cho VNPAY để xác nhận đã nhận (theo yêu cầu của VNPAY)
        if (verify.isSuccess) {
             // **THỰC HIỆN CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH CÔNG TẠI ĐÂY**
             return { statusCode: 200, body: JSON.stringify({ RspCode: '00', Message: 'Confirm success' }) };
        } else {
            // Thanh toán thất bại hoặc Hash sai (RspCode 97)
            return { statusCode: 200, body: JSON.stringify({ RspCode: '97', Message: verify.message }) };
        }

    } catch (error) {
        console.error("VNPAY IPN ERROR:", error);
        return { statusCode: 500, body: JSON.stringify({ RspCode: '99', Message: 'System error' }) };
    }
};
