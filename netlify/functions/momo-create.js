// File: netlify/functions/momo-create.js
const axios = require('axios');
const crypto = require('crypto-js');

// 1. KHAI BÁO BIẾN MÔI TRƯỜNG (SẼ LẤY TỪ NETLIFY DASHBOARD - Bước 4)
const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;

// 2. CẤU HÌNH CỐ ĐỊNH 
const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';
const requestType = 'payWithMethod'; 

// 🛑 3. ĐỊA CHỈ TRẢ VỀ (ĐẢM BẢO URL NETLIFY CỦA BẠN CHÍNH XÁC) 🛑
const siteUrl = 'https://23dh.netlify.app'; // Thay thế nếu tên miền của bạn khác
const redirectUrl = siteUrl + '/giohang.html';
const ipnUrl = siteUrl + '/.netlify/functions/momo-ipn'; 

exports.handler = async (event) => {
    // ... (Toàn bộ code logic MoMo như tôi đã cung cấp trước đó)
    // ...
    // ...
    // ...
    // Gửi request lên MoMo và trả về payUrl
    try {
        const { totalAmount, orderId, orderInfo } = JSON.parse(event.body);
        
        // ... (Logic tạo Signature và RequestBody)

        const rawSignature = 
            `accessKey=${accessKey}&amount=${totalAmount}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${orderId}&requestType=${requestType}`;
        
        const signature = crypto.HmacSHA256(rawSignature, secretKey).toString();

        const requestBody = {
            partnerCode: partnerCode,
            requestId: orderId,
            amount: totalAmount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: 'vi',
            extraData: '',
            requestType: requestType,
            signature: signature
        };

        const response = await axios.post(endpoint, requestBody);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ payUrl: response.data.payUrl })
        };
    } catch (error) {
        console.error('MoMo API Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create MoMo payment request.' })
        };
    }
};
