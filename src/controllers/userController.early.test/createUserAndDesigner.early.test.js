// Unit tests for: createUserAndDesigner

const { createUserAndDesigner } = require("../userController");
const User = require("../../models/userModel");
const Designer = require("../../models/designerModel");
const { admin } = require("../../service/firebaseServices");
const nodemailer = require("nodemailer");
const { Twilio } = require("twilio");

// jest.mock("../../src/models/userModel");
// jest.mock("../../src/models/designerModel");
// jest.mock("../../src/service/firebaseServices");
jest.mock("nodemailer");
// jest.mock("../../src/controllers/userController", () => ({
//   ...jest.requireActual("../../src/controllers/userController"),
//   addPickupLocation: jest.fn(),
// }));

describe("createUserAndDesigner() createUserAndDesigner method", () => {
  let req, res, session, transporter;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
        phoneNumber: "1234567890",
        role: "Designer",
        address: [
          {
            nick_name: "Home",
            city: "City",
            pincode: "123456",
            state: "State",
            street_details: "123 Street",
          },
        ],
        is_creator: true,
        shortDescription: "Short description",
        about: "About the designer",
        logoUrl: "http://logo.url",
        backgroundImageUrl: "http://background.url",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    transporter = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    User.startSession.mockResolvedValue(session);
    nodemailer.createTransport.mockReturnValue(transporter);
  });

  describe("Happy paths", () => {
    it("should create a user and designer successfully", async () => {
      // Mock successful responses
      User.findOne.mockResolvedValue(null);
      admin.auth().createUser.mockResolvedValue({ uid: "firebaseUid" });
      addPickupLocation.mockResolvedValue({ success: true });
      User.prototype.save.mockResolvedValue();
      Designer.prototype.save.mockResolvedValue();

      await createUserAndDesigner(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(admin.auth().createUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
        phoneNumber: "1234567890",
      });
      expect(addPickupLocation).toHaveBeenCalled();
      expect(User.prototype.save).toHaveBeenCalled();
      expect(Designer.prototype.save).toHaveBeenCalled();
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User, Designer, and Pickup Location created successfully",
        })
      );
    });
  });

  describe("Edge cases", () => {
    it("should return 400 if user already exists", async () => {
      // Mock user already exists
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      await createUserAndDesigner(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User already exists with this email",
      });
    });

    it("should return 500 if pickup location creation fails", async () => {
      // Mock pickup location failure
      User.findOne.mockResolvedValue(null);
      addPickupLocation.mockResolvedValue({ success: false });

      await createUserAndDesigner(req, res);

      expect(addPickupLocation).toHaveBeenCalled();
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Failed to create pickup location"),
        })
      );
    });

    it("should return 500 if Firebase user creation fails", async () => {
      // Mock Firebase user creation failure
      User.findOne.mockResolvedValue(null);
      addPickupLocation.mockResolvedValue({ success: true });
      admin.auth().createUser.mockRejectedValue(new Error("Firebase error"));

      await createUserAndDesigner(req, res);

      expect(admin.auth().createUser).toHaveBeenCalled();
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Firebase error"),
        })
      );
    });

    it("should return 500 if any other error occurs", async () => {
      // Mock unexpected error
      User.findOne.mockRejectedValue(new Error("Unexpected error"));

      await createUserAndDesigner(req, res);

      expect(session.abortTransaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Unexpected error"),
        })
      );
    });
  });
});

// End of unit tests for: createUserAndDesigner
