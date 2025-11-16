const crypto = require('crypto');
const querystring = require('querystring');

// Đảm bảo bạn đã khai báo VNP_HASHSECRET trong Netlify Environment Variables
const vnp_HashSecret = process.env.VNP_HASHSECRET; 

// HÀM XỬ LÝ CHÍNH KHI VNPAY GỌI ĐẾN (IPN)
exports.handler = async (event) => {
    // Chỉ chấp nhận GET request từ VNPAY
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Lấy tất cả tham số từ URL
    const vnp_Params = event.queryStringParameters;
    
    // 1. Tách Mã Hash Bảo mật (SecureHash)
    let secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash']; // Xóa hash cũ để tạo hash mới

    // 2. Sắp xếp lại tham số và Tạo lại Mã Hash
    const sortedParams = sortObject(vnp_Params); 
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    const newSecureHash = crypto.createHmac('sha512', vnp_HashSecret)
                                 .update(signData)
                                 .digest('hex');

    // --- 3. XÁC MINH CHỮ KÝ BẢO MẬT ---
    if (secureHash !== newSecureHash) {
        // Trả về mã lỗi: Sai chữ ký bảo mật (RspCode: '97')
        return { 
            statusCode: 200, 
            body: JSON.stringify({ RspCode: '97', Message: 'Invalid signature' }) 
        };
    }
    
    // --- 4. XÁC MINH THÀNH CÔNG, BẮT ĐẦU XỬ LÝ KẾT QUẢ GIAO DỊCH ---
    
    const responseCode = vnp_Params['vnp_ResponseCode'];
    const vnpTxnRef = vnp_Params['vnp_TxnRef']; // Mã đơn hàng
    
    let result = { RspCode: '00', Message: 'Confirm success' }; // Mặc định trả về

    // KIỂM TRA MÃ PHẢN HỒI VNPAY
    if (responseCode === '00') {
        // Thanh toán thành công 
        
        // ************************************************************
        // * Nếu sau này bạn có DB, hãy thực hiện CẬP NHẬT ĐƠN HÀNG *
        // * tại đây. Nếu cập nhật thất bại, hãy trả về RspCode '99'. *
        // ************************************************************

        result.RspCode = '00';
        result.Message = 'Transaction success, confirmation received';
    } else {
        // Thanh toán thất bại hoặc các lỗi khác
        
        // ************************************************************
        // * Nếu sau này bạn có DB, hãy thực hiện HỦY/ĐÁNH DẤU THẤT BẠI *
        // * tại đây.                                                  *
        // ************************************************************
        
        // Vẫn trả về RspCode: '00' để thông báo với VNPAY đã nhận được kết quả (theo chuẩn IPN)
        result.RspCode = '00'; 
        result.Message = 'Transaction failed, confirmation received';
    }

    // Trả về kết quả cuối cùng cho VNPAY
    return { 
        statusCode: 200, 
        body: JSON.stringify(result) 
    };
};

// Hàm phụ trợ để sắp xếp tham số (Bắt buộc cho VNPAY)
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    for (let key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}
