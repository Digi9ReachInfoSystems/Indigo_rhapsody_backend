// Unit tests for: createCouponForPromotion

const { createCouponForPromotion } = require("../couponController");
const Coupon = require("../../models/couponsModel");
const {
  validateCoupon,
  hasUserUsedCoupon,
  markCouponAsUsed,
} = require("../../utils/couponUtils");

// Import necessary modules and dependencies
// Mock the Coupon model
// jest.mock("../../src/models/couponsModel");

describe("createCouponForPromotion() createCouponForPromotion method", () => {
  let req, res;

  beforeEach(() => {
    // Set up a mock request and response object
    req = {
      body: {
        couponCode: "PROMO2023",
        couponAmount: 10,
        expiryDate: "2023-12-31",
        maxUsage: 5,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("Happy Paths", () => {
    it("should create a promotion coupon successfully", async () => {
      // Mock the Coupon.findOne method to return null (no existing coupon)
      Coupon.findOne.mockResolvedValue(null);

      // Mock the save method to simulate successful coupon creation
      Coupon.prototype.save = jest.fn().mockResolvedValue({
        couponCode: "PROMO2023",
        couponAmount: 10,
        expiryDate: new Date("2023-12-31"),
        is_active: true,
        created_for_promotion: {
          created_at: new Date(),
          no_of_max_usage: 5,
        },
      });

      // Call the function
      await createCouponForPromotion(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Promotion coupon created successfully",
        data: expect.objectContaining({
          couponCode: "PROMO2023",
          couponAmount: 10,
        }),
      });
    });
  });

  describe("Edge Cases", () => {
    it("should return 400 if required fields are missing", async () => {
      // Remove couponCode from the request body
      req.body.couponCode = undefined;

      // Call the function
      await createCouponForPromotion(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "couponCode, couponAmount and expiryDate are required",
      });
    });

    it("should return 400 if coupon code already exists", async () => {
      // Mock the Coupon.findOne method to return an existing coupon
      Coupon.findOne.mockResolvedValue({ couponCode: "PROMO2023" });

      // Call the function
      await createCouponForPromotion(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Coupon code already exists",
      });
    });

    it("should return 400 if expiry date is in the past", async () => {
      // Set expiryDate to a past date
      req.body.expiryDate = "2020-01-01";

      // Mock the Coupon.findOne method to return null (no existing coupon)
      Coupon.findOne.mockResolvedValue(null);

      // Call the function
      await createCouponForPromotion(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Expiry date must be in the future",
      });
    });

    it("should handle internal server errors gracefully", async () => {
      // Mock the Coupon.findOne method to throw an error
      Coupon.findOne.mockRejectedValue(new Error("Database error"));

      // Call the function
      await createCouponForPromotion(req, res);

      // Assert the response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
        error: "Database error",
      });
    });
  });
});

// End of unit tests for: createCouponForPromotion
