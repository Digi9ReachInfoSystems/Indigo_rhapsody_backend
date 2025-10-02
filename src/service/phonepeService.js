const crypto = require('crypto');
const axios = require('axios');

class PhonePeService {
    constructor() {
        this.merchantId = process.env.PHONEPE_MERCHANT_ID || 'MERCHANTUAT';
        this.saltKey = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3c6faf0e5d8f';
        this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
        this.baseUrl = process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
        this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || 'https://your-app.com/payment/callback';
        this.callbackUrl = process.env.PHONEPE_CALLBACK_URL || 'https://your-app.com/api/payment/phonepe/callback';
    }

    // Generate SHA256 hash
    generateSHA256(payload) {
        return crypto.createHash('sha256').update(payload).digest('hex');
    }

    // Generate X-VERIFY header
    generateXVerify(payload) {
        const base64Payload = Buffer.from(payload).toString('base64');
        const checksum = this.generateSHA256(base64Payload + '/pg/v1/pay' + this.saltKey);
        return checksum + '###' + this.saltIndex;
    }

    // Create payment request
    async createPaymentRequest(paymentData) {
        try {
            const {
                amount,
                orderId,
                customerId,
                customerEmail,
                customerPhone,
                customerName,
                description = 'Stylist Registration Fee'
            } = paymentData;

            const payload = {
                merchantId: this.merchantId,
                merchantTransactionId: orderId,
                merchantUserId: customerId,
                amount: amount * 100, // PhonePe expects amount in paise
                redirectUrl: this.redirectUrl,
                redirectMode: 'POST',
                callbackUrl: this.callbackUrl,
                mobileNumber: customerPhone,
                paymentInstrument: {
                    type: 'PAY_PAGE'
                },
                deviceContext: {
                    deviceOS: 'ANDROID'
                },
                userContext: {
                    userAgent: 'Mozilla/5.0'
                },
                merchantOrderId: orderId,
                message: description,
                shortName: 'STYLIST_REG',
                paymentExpiryTime: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
            };

            const payloadString = JSON.stringify(payload);
            const xVerify = this.generateXVerify(payloadString);

            const response = await axios.post(
                `${this.baseUrl}/pg/v1/pay`,
                { request: payloadString },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': xVerify,
                        'accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: {
                        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
                        transactionId: response.data.data.merchantTransactionId,
                        paymentId: response.data.data.transactionId
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Payment request failed',
                    error: response.data.message
                };
            }
        } catch (error) {
            console.error('PhonePe payment request error:', error);
            return {
                success: false,
                message: 'Payment request failed',
                error: error.message
            };
        }
    }

    // Verify payment status
    async verifyPayment(transactionId) {
        try {
            const payload = {
                merchantId: this.merchantId,
                merchantTransactionId: transactionId,
                merchantUserId: 'USER_ID' // This should be the actual user ID
            };

            const payloadString = JSON.stringify(payload);
            const xVerify = this.generateXVerify(payloadString);

            const response = await axios.get(
                `${this.baseUrl}/pg/v1/status/${this.merchantId}/${transactionId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': xVerify,
                        'accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const paymentData = response.data.data;
                return {
                    success: true,
                    data: {
                        transactionId: paymentData.merchantTransactionId,
                        paymentId: paymentData.transactionId,
                        amount: paymentData.amount / 100, // Convert from paise to rupees
                        status: paymentData.state,
                        responseCode: paymentData.responseCode,
                        responseMessage: paymentData.responseMessage,
                        paymentTime: paymentData.paymentTime
                    }
                };
            } else {
                return {
                    success: false,
                    message: 'Payment verification failed',
                    error: response.data.message
                };
            }
        } catch (error) {
            console.error('PhonePe payment verification error:', error);
            return {
                success: false,
                message: 'Payment verification failed',
                error: error.message
            };
        }
    }

    // Handle payment callback
    handlePaymentCallback(callbackData) {
        try {
            const { response } = callbackData;
            const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());

            return {
                success: true,
                data: {
                    transactionId: decodedResponse.data.merchantTransactionId,
                    paymentId: decodedResponse.data.transactionId,
                    amount: decodedResponse.data.amount / 100,
                    status: decodedResponse.data.state,
                    responseCode: decodedResponse.data.responseCode,
                    responseMessage: decodedResponse.data.responseMessage,
                    paymentTime: decodedResponse.data.paymentTime
                }
            };
        } catch (error) {
            console.error('PhonePe callback handling error:', error);
            return {
                success: false,
                message: 'Callback handling failed',
                error: error.message
            };
        }
    }
}

module.exports = new PhonePeService();
