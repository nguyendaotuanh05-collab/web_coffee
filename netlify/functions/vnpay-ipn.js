const crypto = require('crypto');
const querystring = require('querystring');

// Đã sửa tên biến Hash Secret cho khớp với Netlify
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

    // 3. XÁC MINH CHỮ KÝ BẢO MẬT
    if (secureHash !== newSecureHash) {
        // Trả về mã lỗi: Sai chữ ký bảo mật
        return { 
            statusCode: 200, 
            body: JSON.stringify({ RspCode: '97', Message: 'Invalid signature' }) 
        };
    }
    
    // 4. TRẢ VỀ PHẢN HỒI THÀNH CÔNG CHO VNPAY
    // (Xác minh thành công, nhưng không có DB để cập nhật)
    // Trả về RspCode '00' để thông báo cho VNPAY rằng bạn đã nhận được phản hồi.
    return { 
        statusCode: 200, 
        body: JSON.stringify({ RspCode: '00', Message: 'Confirm success' }) 
    };
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
