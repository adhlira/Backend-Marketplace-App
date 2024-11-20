import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authToken, authorizePermission } from "../authenticate_token.js";
import { Permission } from "../authorization.js";

const prisma = new PrismaClient();
const router = Router();

router.use(authToken);

router.post("/cart", authorizePermission(Permission.ADD_CART), async (req, res) => {
  const { product_id, size_id, color_id, quantity } = req.body;
  const user = await prisma.tokens.findUnique({ where: { token: req.headers.authorization } });
  const product = await prisma.products.findFirst({
    where: { id: product_id },
  });
  try {
    const cart = await prisma.cart.create({
      data: {
        user_id: user.user_id,
        product_id: product_id,
        size_id: size_id,
        color_id: color_id,
        quantity: quantity,
        total: quantity * product.price,
      },
    });
    res.status(200).json({ message: "Added data successfully", cart });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.get("/cart", authorizePermission(Permission.BROWSE_CART), async (req, res) => {
  try {
    const user = await prisma.tokens.findUnique({ where: { token: req.headers.authorization } });
    const cart = await prisma.cart.findMany({
      where: { user_id: user.user_id },
      include: {
        Colors: {
          select: {
            name: true,
          },
        },
        Sizes: {
          select: {
            name: true,
          },
        },
      },
    });
    if (cart.length == 0) {
      res.status(404).json({ message: "Cart is empty" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

export default router;
