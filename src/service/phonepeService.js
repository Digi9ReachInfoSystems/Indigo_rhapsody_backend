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

    // API endpoints
    this.authUrl =
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";

    this.baseUrl = "https://api.phonepe.com/apis/pg/checkout/v2";

    // Redirect and callback URLs
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || "http://localhost:3000/payment-status?orderId=";

    this.callbackUrl =
      process.env.PHONEPE_CALLBACK_URL ||
      "https://indigo-rhapsody-backend-ten.vercel.app/payment/webhook";
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
  async createPaymentRequest(paymentData) {
    try {
      const { amount, orderId, customerId, customerPhone } = paymentData;
      const token = await this.getAuthToken();

      const url = `${this.baseUrl}/pay`;

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
            redirectUrl: `${this.redirectUrl}${orderId}`,
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

}

module.exports = new PhonePeService();
