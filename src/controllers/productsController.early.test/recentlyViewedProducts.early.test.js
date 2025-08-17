// Unit tests for: Recently Viewed Products functionality

const { 
  trackProductView, 
  getRecentlyViewedProducts, 
  clearRecentlyViewedProducts 
} = require("../productsController");
const Product = require("../../models/productModels");
const User = require("../../models/userModel");

describe("Recently Viewed Products Functionality", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      user: { id: "user123" }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe("trackProductView()", () => {
    it("should track product view successfully", async () => {
      req.params = { productId: "product123" };
      
      const mockProduct = {
        _id: "product123",
        productName: "Test Product"
      };

      const mockUser = {
        _id: "user123",
        recentlyViewedProducts: [],
        save: jest.fn().mockResolvedValue(true)
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await trackProductView(req, res);

      expect(Product.findById).toHaveBeenCalledWith("product123");
      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product view tracked successfully",
        productId: "product123"
      });
    });

    it("should update existing product view and move to top", async () => {
      req.params = { productId: "product123" };
      
      const mockProduct = {
        _id: "product123",
        productName: "Test Product"
      };

      const mockUser = {
        _id: "user123",
        recentlyViewedProducts: [
          { productId: "product456", viewedAt: new Date() },
          { productId: "product123", viewedAt: new Date() }
        ],
        save: jest.fn().mockResolvedValue(true)
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await trackProductView(req, res);

      expect(mockUser.recentlyViewedProducts[0].productId.toString()).toBe("product123");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should limit to 20 recently viewed products", async () => {
      req.params = { productId: "product123" };
      
      const mockProduct = {
        _id: "product123",
        productName: "Test Product"
      };

      // Create 21 existing products
      const existingProducts = Array.from({ length: 21 }, (_, i) => ({
        productId: `product${i}`,
        viewedAt: new Date()
      }));

      const mockUser = {
        _id: "user123",
        recentlyViewedProducts: existingProducts,
        save: jest.fn().mockResolvedValue(true)
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await trackProductView(req, res);

      expect(mockUser.recentlyViewedProducts.length).toBe(20);
      expect(mockUser.recentlyViewedProducts[0].productId.toString()).toBe("product123");
    });

    it("should return 400 for invalid product ID", async () => {
      req.params = { productId: "invalid-id" };

      await trackProductView(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid product ID"
      });
    });

    it("should return 404 when product not found", async () => {
      req.params = { productId: "product123" };
      
      Product.findById = jest.fn().mockResolvedValue(null);

      await trackProductView(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product not found"
      });
    });

    it("should return 401 when user not authenticated", async () => {
      req.params = { productId: "product123" };
      req.user = null;

      await trackProductView(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User authentication required"
      });
    });
  });

  describe("getRecentlyViewedProducts()", () => {
    it("should return recently viewed products", async () => {
      req.query = { limit: "5" };
      
      const mockUser = {
        _id: "user123",
        recentlyViewedProducts: [
          {
            productId: {
              _id: "product123",
              productName: "Product 1",
              description: "Description 1",
              price: 100,
              category: { name: "Category 1" },
              subCategory: { name: "SubCategory 1" }
            },
            viewedAt: new Date()
          }
        ]
      };

      User.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      await getRecentlyViewedProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recently viewed products retrieved successfully",
        products: expect.arrayContaining([
          expect.objectContaining({
            productId: "product123",
            productName: "Product 1"
          })
        ]),
        totalCount: 1
      });
    });

    it("should return 401 when user not authenticated", async () => {
      req.user = null;

      await getRecentlyViewedProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User authentication required"
      });
    });

    it("should return 404 when user not found", async () => {
      User.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getRecentlyViewedProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });
  });

  describe("clearRecentlyViewedProducts()", () => {
    it("should clear recently viewed products", async () => {
      const mockUser = {
        _id: "user123",
        recentlyViewedProducts: [
          { productId: "product123", viewedAt: new Date() }
        ],
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);

      await clearRecentlyViewedProducts(req, res);

      expect(mockUser.recentlyViewedProducts).toEqual([]);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recently viewed products cleared successfully"
      });
    });

    it("should return 401 when user not authenticated", async () => {
      req.user = null;

      await clearRecentlyViewedProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "User authentication required"
      });
    });

    it("should return 404 when user not found", async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      await clearRecentlyViewedProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });
  });
});
