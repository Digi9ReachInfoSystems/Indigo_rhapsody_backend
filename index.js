require("dotenv").config(); // This should be at the VERY TOP of your file
const express = require("express");
const router = express.Router();
const categoryRoutes = require("./src/routes/categoryRoutes.js");
const productRoutes = require("./src/routes/productRoutes.js");
const connectDB = require("./src/config/database");
const subcategoryRoutes = require("./src/routes/subcategoryRoutes.js");
const cartRoutes = require("./src/routes/cartRoutes.js");
const orderRoutes = require("./src/routes/orderRoutes.js");
const paymentRoutes = require("./src/routes/paymentRoutes.js");
const userRoutes = require("./src/routes/userRoutes.js");
const authRoutes = require("./src/routes/authRoutes.js");
const shippingRoutes = require("./src/routes/shippingRoutes.js");
const designerRoutes = require("./src/routes/designerRoutes.js");
const bannerRoutes = require("./src/routes/bannerRoutes.js");
const filterRoutes = require("./src/routes/filterRoutes.js");
const contentVideoRoutes = require("./src/routes/contentVideoRoutes.js");
const videoRoutes = require("./src/routes/videoRoutes.js");
const coupons = require("./src/routes/couponRoutes.js");
const wishlist = require("./src/routes/wishlistRoutes.js");
const notifications = require("./src/routes/notificationroutes.js");
const states = require("./src/routes/stateRoutes.js");
const queryRoutes = require("./src/routes/queryRoutes.js");
const Blogs = require("./src/routes/blogsRoutes.js");
const app = express();

const cors = require("cors");
app.use(cors());

// app.use((req, res, next) => {
//   console.log(`${req.method} request for '${req.url}'`);
//   next();
// });

connectDB();

app.use(express.json());

app.use("/products", productRoutes);
app.use("/queries", queryRoutes);
app.use("/category", categoryRoutes);
app.use("/subcategory", subcategoryRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/shipping", shippingRoutes);
app.use("/designer", designerRoutes);
app.use("/banner", bannerRoutes);
app.use("/filter", filterRoutes);
app.use("/video", videoRoutes);
app.use("/content-video", contentVideoRoutes);
app.use("/coupon", coupons);
app.use("/wishlist", wishlist);
app.use("/notification", notifications);
app.use("/states", states);
app.use("/blogs", Blogs);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Bueno Noches!Hola amigo kaise ho theek ho  Server running on port ${PORT}`
  );
});
