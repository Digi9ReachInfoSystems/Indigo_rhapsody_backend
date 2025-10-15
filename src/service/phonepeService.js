const axios = require("axios");

class PhonePeService {
  constructor() {
    // Configuration values
    this.clientId = process.env.PHONEPE_CLIENT_ID || "SU2510141432464834659105";
    this.clientSecret =
      process.env.PHONEPE_CLIENT_SECRET ||
      "089c4f5c-b7e2-4c3a-820d-c1f5ccc5002a";
    this.clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1.0";
    this.env = "production";

    // Legacy API Configuration (X-VERIFY method)
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || "M1LA2M87XNOE";
    this.saltKey = process.env.PHONEPE_SALT_KEY || "6362bd9f-17b6-4eb2-b030-1ebbb78ce518";
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || "1";

    // API endpoints
    this.authUrl =
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";

    this.baseUrl = "https://api.phonepe.com/apis/pg/checkout/v2/pay";
    this.legacyBaseUrl = process.env.PHONEPE_LEGACY_BASE_URL || "https://api.phonepe.com/apis/hermes";

    // Redirect and callback URLs
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || "http://localhost:3000/payment-status?orderId=";

    this.callbackUrl =
      process.env.PHONEPE_CALLBACK_URL ||
      "https://indigo-rhapsody-backend-ten.vercel.app/payment/webhook";
  }

  // 🔐 Generate SHA256 Hash for X-VERIFY (Legacy API)
  generateSHA256(data) {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // 🔐 Generate X-VERIFY Header for /pay endpoint
  generateXVerifyForPay(base64Payload) {
    const data = base64Payload + "/pg/v1/pay" + this.saltKey;
    const hash = this.generateSHA256(data);
    return `${hash}###${this.saltIndex}`;
  }

  // 🔐 Generate X-VERIFY Header for /status endpoint
  generateXVerifyForStatus(merchantTransactionId) {
    const data = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}` + this.saltKey;
    const hash = this.generateSHA256(data);
    return `${hash}###${this.saltIndex}`;
  }

  // 🔐 Generate OAuth Access Token
  async getAuthToken() {
    try {
      const params = new URLSearchParams();
      params.append("client_id", this.clientId);
      params.append("client_version", this.clientVersion);
      params.append("client_secret", this.clientSecret);
      params.append("grant_type", "client_credentials");

      const response = await axios.post(this.authUrl, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data?.access_token) {
        console.log("✅ PhonePe Auth Token generated successfully");
        return response.data.access_token;
      } else {
        throw new Error("No access token in response");
      }
    } catch (error) {
      console.error(
        "❌ Error generating PhonePe Auth Token:",
        error.response?.data || error.message
      );
      throw new Error("Failed to generate PhonePe access token");
    }
  }

  // 💳 Create Payment Request (Standard Checkout API v2)
  // 💳 Create Payment (Standard Checkout v2)
  async createPaymentRequest(paymentData) {
    try {
      const { amount, orderId, customerId, customerPhone } = paymentData;
      const token = await this.getAuthToken();

      const url = `${this.baseUrl}/checkout/v2/pay`;

      const payload = {
        merchantOrderId: orderId,
        amount: Math.round(parseFloat(amount) * 100), // Convert to paise and round to avoid decimals
        expireAfter: 1800, // 30 minutes
        metaInfo: {
          customerId,
          customerPhone,
        },
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: "Complete your payment via PhonePe",
          merchantUrls: {
            redirectUrl: this.redirectUrl,
            callbackUrl: this.callbackUrl,
          },
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      });

      // ✅ Handle both possible response structures
      const result = response.data?.data || response.data;

      if (result.redirectUrl) {
        return {
          success: true,
          message: "Payment initiated successfully",
          data: {
            orderId: result.orderId,
            state: result.state,
            expireAt: result.expireAt,
            redirectUrl: result.redirectUrl,
          },
        };
      } else {
        console.error("⚠️ Unexpected PhonePe response:", response.data);
        return {
          success: false,
          message: result.message || "Failed to initiate payment",
          error: response.data,
        };
      }
    } catch (error) {
      console.error(
        "❌ PhonePe createPaymentRequest Error:",
        error.response?.data || error
      );
      return {
        success: false,
        message: "Payment initiation failed",
        error: error.response?.data || error.message,
      };
    }
  }

  // 🔍 Verify Payment Status
  async verifyPayment(orderId) {
    try {
      const token = await this.getAuthToken();
      const url = `${this.baseUrl}/checkout/v2/order/${orderId}/status`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${token}`,
        },
      });

      if (response.data?.data) {
        const data = response.data.data;
        console.log("✅ Payment verification response:", data);
        return {
          success: true,
          data: {
            orderId: data.orderId,
            amount: data.amount / 100,
            status: data.state,
            responseCode: data.responseCode,
            responseMessage: data.responseMessage,
          },
        };
      } else {
        return {
          success: false,
          message: "Payment status not found",
          error: response.data,
        };
      }
    } catch (error) {
      console.error(
        "❌ PhonePe verifyPayment Error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: "Failed to verify payment",
        error: error.response?.data || error.message,
      };
    }
  }

  // 📦 Handle Callback / Webhook Response
  handlePaymentCallback(callbackData) {
    try {
      console.log("📦 PhonePe Callback Data:", JSON.stringify(callbackData, null, 2));

      // Handle new webhook format
      if (callbackData.event === "checkout.order.completed" && callbackData.payload) {
        const { payload } = callbackData;

        console.log("🎯 Processing PhonePe Order Completed Event");
        console.log("Order ID:", payload.orderId);
        console.log("Merchant Order ID:", payload.merchantOrderId);
        console.log("State:", payload.state);
        console.log("Amount:", payload.amount);

        // Extract payment details
        const paymentDetails = payload.paymentDetails && payload.paymentDetails.length > 0
          ? payload.paymentDetails[0]
          : null;

        const responseData = {
          orderId: payload.orderId,
          merchantOrderId: payload.merchantOrderId,
          merchantId: payload.merchantId,
          state: payload.state,
          amount: payload.amount,
          expireAt: payload.expireAt,
          metaInfo: payload.metaInfo,
          transactionId: paymentDetails?.transactionId || payload.orderId,
          paymentMode: paymentDetails?.paymentMode || "UNKNOWN",
          timestamp: paymentDetails?.timestamp || Date.now(),
          paymentAmount: paymentDetails?.amount || payload.amount,
          paymentState: paymentDetails?.state || payload.state,
          status: payload.state === "COMPLETED" ? "COMPLETED" : "FAILED",
          responseCode: payload.state === "COMPLETED" ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
          responseMessage: payload.state === "COMPLETED" ? "Payment completed successfully" : "Payment failed",
        };

        console.log("✅ Processed PhonePe Webhook Response:", responseData);

        return {
          success: true,
          data: responseData,
        };
      }

      // Handle legacy webhook format (fallback)
      console.log("📦 Processing Legacy PhonePe Callback Format");
      return {
        success: true,
        data: callbackData,
      };
    } catch (error) {
      console.error("❌ PhonePe Callback Handling Error:", error);
      return {
        success: false,
        message: "Callback handling failed",
        error: error.message,
      };
    }
  }

  // 💳 Create Payment (Legacy API v1 with X-VERIFY)
  async createPaymentLegacy(paymentData) {
    try {
      const {
        amount,
        merchantTransactionId,
        merchantUserId,
        mobileNumber,
        email,
        redirectMode = "POST",
      } = paymentData;

      // Build redirect URL with orderId appended
      const redirectUrlWithOrderId = `${this.redirectUrl}${merchantTransactionId}`;

      console.log("🔗 Redirect URL with Order ID:", redirectUrlWithOrderId);

      // Build the payload
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: merchantUserId,
        amount: Math.round(parseFloat(amount) * 100), // Convert to paise
        redirectUrl: redirectUrlWithOrderId,  // ✅ Append orderId to redirectUrl
        redirectMode: redirectMode,
        callbackUrl: this.callbackUrl,
        mobileNumber: mobileNumber,
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      // Add email if provided
      if (email) {
        payload.email = email;
      }

      console.log("📦 PhonePe Legacy API Payload:", payload);

      // Convert payload to JSON string
      const jsonString = JSON.stringify(payload);

      // Encode to base64
      const base64String = Buffer.from(jsonString).toString("base64");

      console.log("📦 Base64 Payload:", base64String);

      // Generate X-VERIFY header
      const xVerify = this.generateXVerifyForPay(base64String);

      console.log("🔐 X-VERIFY Header:", xVerify);

      // Make API call to legacy endpoint
      const url = `${this.legacyBaseUrl}/pg/v1/pay`;

      const response = await axios.post(
        url,
        {
          request: base64String,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            accept: "application/json",
          },
        }
      );

      console.log("✅ PhonePe Legacy API Response:", response.data);

      // Check response
      if (response.data.success) {
        return {
          success: true,
          message: "Payment initiated successfully",
          data: {
            merchantTransactionId: response.data.data.merchantTransactionId,
            transactionId: response.data.data.transactionId,
            paymentUrl:
              response.data.data.instrumentResponse?.redirectInfo?.url || null,
            redirectUrl:
              response.data.data.instrumentResponse?.redirectInfo?.url || null,
          },
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Payment initiation failed",
          error: response.data,
        };
      }
    } catch (error) {
      console.error(
        "❌ PhonePe Legacy API Error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: "Payment initiation failed",
        error: error.response?.data || error.message,
      };
    }
  }

  // 🔍 Check Payment Status (Legacy API v1 with X-VERIFY)
  async checkPaymentStatusLegacy(merchantTransactionId) {
    try {
      // Generate X-VERIFY header for status check
      const xVerify = this.generateXVerifyForStatus(merchantTransactionId);

      const url = `${this.legacyBaseUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          accept: "application/json",
        },
      });

      console.log("✅ PhonePe Status Check Response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        return {
          success: true,
          data: {
            merchantTransactionId: data.merchantTransactionId,
            transactionId: data.transactionId,
            amount: data.amount / 100, // Convert from paise
            status: data.state,
            responseCode: data.responseCode,
            responseMessage: data.responseMessage || data.message,
          },
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Status check failed",
          error: response.data,
        };
      }
    } catch (error) {
      console.error(
        "❌ PhonePe Legacy Status Check Error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: "Failed to check payment status",
        error: error.response?.data || error.message,
      };
    }
  }
}

module.exports = new PhonePeService();
