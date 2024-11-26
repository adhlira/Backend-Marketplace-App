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
    if (product.quantity < quantity) {
      res.status(401).json({ message: "Insufficient product stock" });
    } else {
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
    }
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
    } else {
      res.status(200).json(cart);
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.put("/cart/:id", authorizePermission(Permission.EDIT_CART), async (req, res) => {
  const { size_id, color_id, quantity } = req.body;
  const user = await prisma.tokens.findUnique({ where: { token: req.headers.authorization } });
  const cart = await prisma.cart.findFirst({ where: { id: +req.params.id, user_id: user.user_id } });
  const product = await prisma.products.findFirst({ where: { id: cart.product_id } });
  if (!cart) {
    res.status(404).json({ message: "Cart not found" });
  }
  try {
    const updatedData = {};

    //jika yg diupdate hanya quantity saja
    if (quantity && !color_id && !size_id) {
      (updatedData.quantity = quantity), (updatedData.total = quantity * product.price);
    }

    //jika yg diupdate quantity dan color id
    if (quantity && color_id && !size_id) {
      (updatedData.quantity = quantity), (updatedData.total = quantity * product.price), (updatedData.color_id = color_id);
    }

    //jika yg diupdate quantity dan size id
    if (quantity && !color_id && size_id) {
      (updatedData.quantity = quantity), (updatedData.total = quantity * product.price), (updatedData.size_id = size_id);
    }

    //jika yg diupdate color id atau size id
    if (!quantity && (color_id || size_id)) {
      if (color_id) updatedData.color_id = color_id;
      if (size_id) updatedData.size_id = size_id;
    }

    const updated_cart = await prisma.cart.update({
      where: { id: +req.params.id, user_id: user.user_id },
      data: updatedData,
    });
    res.status(200).json({ message: "Updated data successfully", updated_cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/cart/:id", authorizePermission(Permission.DELETE_CART), async (req, res) => {
  const cart = await prisma.cart.findFirst({ where: { id: +req.params.id } });
  const user = await prisma.tokens.findFirst({ where: { token: req.headers.authorization } });
  try {
    if (!cart) {
      res.status(404).json({ message: "Data cart not found" });
    } else {
      await prisma.cart.delete({ where: { id: +req.params.id, user_id: user.user_id } });
      res.status(200).json({ message: "Deleting data successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting data", error });
  }
});

export default router;
