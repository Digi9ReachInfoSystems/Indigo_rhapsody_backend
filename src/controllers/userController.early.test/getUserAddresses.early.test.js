// Unit tests for: getUserAddresses

const { getUserAddresses } = require("../userController");
const User = require("../../models/userModel");
const { admin } = require("../../service/firebaseServices");
const { Twilio } = require("twilio");

// src/controllers/userController.test.js
// jest.mock("../../models/userModel");

describe("getUserAddresses() getUserAddresses method", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { userId: "123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("Happy paths", () => {
    it("should return user addresses when user is found", async () => {
      // Arrange
      const mockUser = {
        _id: "123",
        address: [
          {
            nick_name: "Home",
            city: "CityA",
            pincode: "123456",
            state: "StateA",
            street_details: "Street 1",
          },
          {
            nick_name: "Office",
            city: "CityB",
            pincode: "654321",
            state: "StateB",
            street_details: "Street 2",
          },
        ],
      };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      // Act
      await getUserAddresses(req, res);

      // Assert
      expect(User.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ addresses: mockUser.address });
    });
  });

  describe("Edge cases", () => {
    it("should return 404 when user is not found", async () => {
      // Arrange
      User.findById = jest.fn().mockResolvedValue(null);

      // Act
      await getUserAddresses(req, res);

      // Assert
      expect(User.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should handle errors gracefully", async () => {
      // Arrange
      const errorMessage = "Database error";
      User.findById = jest.fn().mockRejectedValue(new Error(errorMessage));

      // Act
      await getUserAddresses(req, res);

      // Assert
      expect(User.findById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: errorMessage,
      });
    });
  });
});

// End of unit tests for: getUserAddresses
