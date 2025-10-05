const crypto = require("crypto");
const axios = require("axios");

class PhonePeService {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || "M1LA2M87XNOE";
    this.saltKey =
      process.env.PHONEPE_SALT_KEY || "6362bd9f-17b6-4eb2-b030-1ebbb78ce518";
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    this.baseUrl =
      process.env.PHONEPE_BASE_URL || "https://api.phonepe.com/apis/hermes";
    this.redirectUrl =
      process.env.PHONEPE_REDIRECT_URL ||
      "http://localhost:3000/payment/callback";
    this.callbackUrl =
      process.env.PHONEPE_CALLBACK_URL ||
      "https://indigo-rhapsody-backend-ten.vercel.app/order/payment/webhook/phonepe";
  }

  // Generate SHA256 hash
  generateSHA256(payload) {
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  // Generate X-VERIFY for /pay API
  generatePayXVerify(base64Payload) {
    const checksum = this.generateSHA256(
      base64Payload + "/pg/v1/pay" + this.saltKey
    );
    return `${checksum}###${this.saltIndex}`;
  }

  // Generate X-VERIFY for /status API
  generateStatusXVerify(transactionId) {
    const checksum = this.generateSHA256(
      `/pg/v1/status/${this.merchantId}/${transactionId}` + this.saltKey
    );
    return `${checksum}###${this.saltIndex}`;
  }

  // Create payment request
  async createPaymentRequest(paymentData) {
    try {
      const {
        amount,
        orderId,
        customerId,
        customerPhone,
        description = "Stylist Registration Fee",
      } = paymentData;

      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: orderId,
        merchantUserId: customerId,
        amount: amount * 100, // PhonePe expects amount in paise
        redirectUrl: this.redirectUrl,
        redirectMode: "POST",
        callbackUrl: this.callbackUrl,
        mobileNumber: customerPhone,
        paymentInstrument: { type: "PAY_PAGE" },
      };

      // Convert payload to base64
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
        "base64"
      );
      const xVerify = this.generatePayXVerify(base64Payload);

      // Make API call
      const response = await axios.post(
        `${this.baseUrl}/pg/v1/pay`,
        { request: base64Payload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          data: {
            paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
            transactionId: response.data.data.merchantTransactionId,
            paymentId: response.data.data.transactionId,
          },
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Payment request failed",
          error: response.data,
        };
      }
    } catch (error) {
      console.error(
        "PhonePe payment request error:",
        error?.response?.data || error
      );
      return {
        success: false,
        message: "Payment request failed",
        error: error?.response?.data || error.message,
      };
    }
  }

  // Verify payment status
  async verifyPayment(transactionId) {
    try {
      const xVerify = this.generateStatusXVerify(transactionId);

      const response = await axios.get(
        `${this.baseUrl}/pg/v1/status/${this.merchantId}/${transactionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        return {
          success: true,
          data: {
            transactionId: data.merchantTransactionId,
            paymentId: data.transactionId,
            amount: data.amount / 100,
            status: data.state,
            responseCode: data.responseCode,
            responseMessage: data.responseMessage,
          },
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Payment verification failed",
          error: response.data,
        };
      }
    } catch (error) {
      console.error(
        "PhonePe payment verification error:",
        error?.response?.data || error
      );
      return {
        success: false,
        message: "Payment verification failed",
        error: error?.response?.data || error.message,
      };
    }
  }

  // Handle callback response
  handlePaymentCallback(callbackData) {
    try {
      const decoded = JSON.parse(
        Buffer.from(callbackData.response, "base64").toString("utf8")
      );

      return {
        success: true,
        data: {
          transactionId: decoded.data.merchantTransactionId,
          paymentId: decoded.data.transactionId,
          amount: decoded.data.amount / 100,
          status: decoded.data.state,
          responseCode: decoded.data.responseCode,
          responseMessage: decoded.data.responseMessage,
        },
      };
    } catch (error) {
      console.error("PhonePe callback handling error:", error);
      return {
        success: false,
        message: "Callback handling failed",
        error: error.message,
      };
    }
  }
}

module.exports = new PhonePeService();
