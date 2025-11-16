// Cần thêm thư viện 'moment' vào package.json nếu chưa có: "moment": "^2.29.1"
const moment = require('moment'); 
const crypto = require('crypto');
const querystring = require('querystring');

// Đảm bảo bạn đã khai báo các biến này trong Netlify Environment Variables
const tmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASHSECRET;
const vnpUrl = process.env.VNP_URL;
const returnUrl = process.env.VNP_RETURN_URL;

// Hàm xử lý chính của Netlify Function
exports.handler = async (event, context) => {
    // 1. Chỉ chấp nhận phương thức POST từ frontend
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        // 2. Lấy dữ liệu từ body (được gửi từ giohang.html)
        const { amount, orderId, orderInfo } = JSON.parse(event.body);
        
        // Kiểm tra dữ liệu bắt buộc
        if (!amount || !orderId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Thiếu thông tin amount hoặc orderId." }),
            };
        }

        // 3. Thiết lập các tham số VNPAY
        const ipAddr = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';
        const currCode = 'VND';
        const vnp_Params = {};
        
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan don hang ${orderId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPAY yêu cầu giá trị tính bằng Cent
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        
        const createDate = moment().format('YYYYMMDDHHmmss');
        vnp_Params['vnp_CreateDate'] = createDate;

        // 4. Sắp xếp các tham số theo thứ tự alphabet
        const sortedParams = sortObject(vnp_Params);
        
        // 5. Tạo chuỗi dữ liệu để băm (Hash)
        const signData = querystring.stringify(sortedParams, { encode: false });
        
        // 6. Tạo chữ ký bảo mật (Secure Hash)
        const hmac = crypto.createHmac('sha512', hashSecret);
        const secureHash = hmac.update(signData).digest('hex');
        
        // 7. Gắn chữ ký vào tham số và tạo URL
        sortedParams['vnp_SecureHash'] = secureHash;
        
        const finalVnpUrl = vnpUrl + '?' + querystring.stringify(sortedParams, { encode: true });

        // 8. Trả về URL cho Frontend (giohang.html)
        return {
            statusCode: 200,
            body: JSON.stringify({ vnpUrl: finalVnpUrl }),
        };

    } catch (error) {
        console.error("VNPAY CREATE ERROR:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Lỗi nội bộ khi tạo URL VNPAY.", error: error.message }),
        };
    }
};

// Hàm phụ trợ để sắp xếp object theo thứ tự alphabet
function sortObject(obj) {
	const sorted = {};
	const keys = Object.keys(obj).sort();
	for (const key of keys) {
		sorted[key] = obj[key];
	}
	return sorted;
}
