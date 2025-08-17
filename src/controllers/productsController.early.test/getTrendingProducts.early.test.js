// Unit tests for: getTrendingProducts and toggleTrendingStatus

const { getTrendingProducts, toggleTrendingStatus } = require("../productsController");
const Product = require("../../models/productModels");

describe("Trending Products Functionality", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe("getTrendingProducts()", () => {
    it("should return trending products in order when random=false", async () => {
      const mockProducts = [
        {
          _id: "1",
          productName: "Trending Product 1",
          isTrending: true,
          enabled: true,
          category: { name: "Category 1" },
          subCategory: { name: "SubCategory 1" }
        },
        {
          _id: "2", 
          productName: "Trending Product 2",
          isTrending: true,
          enabled: true,
          category: { name: "Category 2" },
          subCategory: { name: "SubCategory 2" }
        }
      ];

      Product.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockProducts)
          })
        })
      });

      await getTrendingProducts(req, res);

      expect(Product.find).toHaveBeenCalledWith({ isTrending: true, enabled: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Trending products retrieved successfully",
        products: mockProducts,
        totalCount: 2,
        isRandom: false
      });
    });

    it("should return random trending products when random=true", async () => {
      req.query = { random: 'true', limit: '5' };
      
      const mockProducts = [
        {
          _id: "1",
          productName: "Random Trending Product 1",
          isTrending: true,
          enabled: true
        }
      ];

      Product.aggregate = jest.fn().mockResolvedValue(mockProducts);

      await getTrendingProducts(req, res);

      expect(Product.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Trending products retrieved successfully",
        products: mockProducts,
        totalCount: 1,
        isRandom: true
      });
    });

    it("should return 404 when no trending products found", async () => {
      Product.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      await getTrendingProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No trending products found",
        products: []
      });
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Database error");
      Product.find = jest.fn().mockImplementation(() => {
        throw error;
      });

      await getTrendingProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching trending products",
        error: "Database error"
      });
    });
  });

  describe("toggleTrendingStatus()", () => {
    it("should toggle trending status from false to true", async () => {
      req.params = { productId: "123" };
      
      const mockProduct = {
        _id: "123",
        productName: "Test Product",
        isTrending: false
      };

      const mockUpdatedProduct = {
        _id: "123",
        productName: "Test Product", 
        isTrending: true,
        category: { name: "Category" },
        subCategory: { name: "SubCategory" }
      };

      Product.findById = jest.fn()
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(mockUpdatedProduct);

      Product.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedProduct)
      });

      await toggleTrendingStatus(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { $set: { isTrending: true } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product marked as trending successfully",
        product: mockUpdatedProduct
      });
    });

    it("should toggle trending status from true to false", async () => {
      req.params = { productId: "123" };
      
      const mockProduct = {
        _id: "123",
        productName: "Test Product",
        isTrending: true
      };

      const mockUpdatedProduct = {
        _id: "123",
        productName: "Test Product",
        isTrending: false,
        category: { name: "Category" },
        subCategory: { name: "SubCategory" }
      };

      Product.findById = jest.fn()
        .mockResolvedValueOnce(mockProduct)
        .mockResolvedValueOnce(mockUpdatedProduct);

      Product.findByIdAndUpdate = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedProduct)
      });

      await toggleTrendingStatus(req, res);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        { $set: { isTrending: false } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product removed from trending successfully",
        product: mockUpdatedProduct
      });
    });

    it("should return 404 when product not found", async () => {
      req.params = { productId: "nonexistent" };
      
      Product.findById = jest.fn().mockResolvedValue(null);

      await toggleTrendingStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product not found"
      });
    });

    it("should handle errors gracefully", async () => {
      req.params = { productId: "123" };
      
      const error = new Error("Database error");
      Product.findById = jest.fn().mockImplementation(() => {
        throw error;
      });

      await toggleTrendingStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error toggling trending status",
        error: "Database error"
      });
    });
  });
});
