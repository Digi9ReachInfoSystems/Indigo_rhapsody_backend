// Unit tests for: updateProfileRequest

const { updateProfileRequest } = require("../designerController");
const Designer = require("../../models/designerModel");
const { bucket } = require("../../service/firebaseServices");
const UpdateRequest = require("../../models/updateDesignerSchema");

// jest.mock("../../../src/models/designerModel");
// jest.mock("../../../src/models/updateDesignerSchema");

describe("updateProfileRequest() updateProfileRequest method", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { designerId: "mockDesignerId" },
      body: { updates: { field: "value" } },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("Happy paths", () => {
    it("should successfully submit a profile update request when designer exists", async () => {
      // Arrange
      Designer.findById.mockResolvedValue({ _id: "mockDesignerId" });
      UpdateRequest.prototype.save = jest
        .fn()
        .mockResolvedValue({ _id: "mockUpdateRequestId" });

      // Act
      await updateProfileRequest(req, res);

      // Assert
      expect(Designer.findById).toHaveBeenCalledWith("mockDesignerId");
      expect(UpdateRequest.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "Profile update request submitted successfully. Pending admin approval.",
        updateRequest: { _id: "mockUpdateRequestId" },
      });
    });
  });

  describe("Edge cases", () => {
    it("should return 404 if designer is not found", async () => {
      // Arrange
      Designer.findById.mockResolvedValue(null);

      // Act
      await updateProfileRequest(req, res);

      // Assert
      expect(Designer.findById).toHaveBeenCalledWith("mockDesignerId");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Designer not found" });
    });

    it("should handle errors during the update request submission", async () => {
      // Arrange
      Designer.findById.mockResolvedValue({ _id: "mockDesignerId" });
      UpdateRequest.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      // Act
      await updateProfileRequest(req, res);

      // Assert
      expect(Designer.findById).toHaveBeenCalledWith("mockDesignerId");
      expect(UpdateRequest.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error submitting profile update request",
        error: "Database error",
      });
    });
  });
});

// End of unit tests for: updateProfileRequest
