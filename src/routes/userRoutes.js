const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/total-count", userController.getTotalUserCount);
router.get("/new-users-month", userController.getNewUsersByCurrentMonth);
router.get("/user-count-by-state", userController.getUserCountByState);
router.get("/most-users-state", userController.getStateWithMostUsers);
router.get("/role-user", userController.getAllUsersWithRoleUser);

router.get("/getUser", userController.getUsers);
router.get("/:userId", userController.getUserById);
router.post("/createUser", userController.createUser);
router.put("/:userId", userController.updateUserAddress);
router.get("/user/:userId/addresses", userController.getUserAddresses);

router.post("/request-otp", userController.requestOtp);

router.post("/user-designer", userController.createUserAndDesigner);
router.post("/login", userController.loginDesigner);
router.post("/adminLogin", userController.loginAdmin);
module.exports = router;
