const { VNPay } = require('vnpay/vnpay');

const tmnCode = process.env.VNP_TMNCODE;
const secureSecret = process.env.VNP_HASHSECRET;
const vnpayHost = process.env.VNP_URL ? process.env.VNP_URL.replace('/paymentv2/vpcpay.html', '') : ''; 

let vnpay;
try {
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
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    if (!vnpay) {
        return { statusCode: 500, body: JSON.stringify({ RspCode: '99', Message: 'System initialization error' }) };
    }

    try {
        const query = event.queryStringParameters;
        // vnpay.verifyReturnUrl có thể dùng để xác thực cả IPN (theo hướng dẫn thư viện)
        const verify = vnpay.verifyReturnUrl(query); 
        
        if (verify.isSuccess) {
             // **THỰC HIỆN CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG THÀNH CÔNG TẠI ĐÂY**
             return { statusCode: 200, body: JSON.stringify({ RspCode: '00', Message: 'Confirm success' }) };
        } else {
            // Lỗi xác thực chữ ký (Hash sai) hoặc lỗi giao dịch.
            return { statusCode: 200, body: JSON.stringify({ RspCode: '97', Message: verify.message }) };
        }

    } catch (error) {
        console.error("VNPAY IPN ERROR:", error);
        return { statusCode: 500, body: JSON.stringify({ RspCode: '99', Message: 'System error' }) };
    }
};