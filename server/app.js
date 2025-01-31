import express from "express";
import { getProductDetails, getProducts } from "./api/index.js";
import { getCachedData, rateLimiter } from "./middleware/index.js";
import { Redis } from "ioredis";
import "dotenv/config";

const app = express();
export const redis = new Redis({
  username: process.env.username,
  password: process.env.password,
  host: process.env.host,
  port: process.env.port,
});

redis.on("connect", () => {
  console.log("Redis Connected");
});

app.get(
  "/",
  rateLimiter({ limit: 30, timer: 60, key: "home" }),
  async (req, res) => {
    res.send(`Hello World! `);
  }
);

app.get(
  "/products",
  rateLimiter({ limit: 5, timer: 20, key: "products" }),
  getCachedData("products"),
  async (req, res) => {
    const products = await getProducts();
    await redis.setex("products", 20, JSON.stringify(products.products));
    res.json(products);
  }
);

app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  const key = `product:${id}`;
  let product = await redis.get(key);
  if (product) {
    if (product) {
      console.log("Get from cache");

      return res.json({
        products: JSON.parse(product),
      });
    }
  }

  product = await getProductDetails(id);
  await redis.set(key, JSON.stringify(product.product));
  res.json({ product });
});

app.get("/order/:id", async (req, res) => {
  const productId = req.params.id;
  const key = `product:${productId}`;

  // Any mutation to database here
  // Like creating new order in database
  // Reducing the product stock in database

  await redis.del(key);

  return res.json({
    message: `Order placed successfully, product id :${productId} is ordered.`,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
