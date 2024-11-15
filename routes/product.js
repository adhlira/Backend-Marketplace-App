import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Permission } from "../authorization.js";
import { authToken, authorizePermission } from "../authenticate_token.js";
import upload from "../multer_config.js";
import path from "path";

const prisma = new PrismaClient();
const router = Router();

router.use(authToken);

router.get("/products", authorizePermission(Permission.BROWSE_PRODUCT), async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        Categories: {
          select: { name: true },
        },
        ProductSize: {
          select: {
            Sizes: {
              select: { name: true },
            },
          },
        },
        ColorProduct: {
          select: {
            Colors: {
              select: {
                name: true,
              },
            },
          },
        },
        ImageProduct: {
          select: {
            image_url: true,
          },
        },
      },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

router.post("/product", authorizePermission(Permission.ADD_PRODUCT), upload.single("image"), async (req, res) => {
  const { category_id, name, price, quantity, description, size_id, color_id } = req.body;
  const user = await prisma.tokens.findFirst({ where: { token: req.headers.authorization } });
  try {
    const product = await prisma.products.create({
      data: {
        user_id: user.user_id,
        category_id: +category_id,
        name: name,
        price: +price,
        quantity: +quantity,
        description: description,
      },
    });
    await prisma.productSize.create({
      data: {
        product_id: +product.id,
        size_id: +size_id,
      },
    });
    await prisma.colorProduct.create({
      data: {
        product_id: product.id,
        color_id: +color_id,
      },
    });
    const image_url = req.file ? `${req.protocol}://${req.get("host")}/public/images/${req.file.filename}` : "https://example.com/default-image.png";
    await prisma.imageProduct.create({
      data: {
        product_id: +product.id,
        image_url: image_url,
      },
    });
    res.status(200).json({ message: "Added Data Product successfully", product });
  } catch (error) {
    console.log("Error saat menyimpan data: ", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/product/:id", authorizePermission(Permission.READ_PRODUCT), async (req, res) => {
  try {
    const product = await prisma.products.findFirst({
      where: { id: +req.params.id },
      include: {
        ProductSize: {
          select: {
            Sizes: { select: { name: true } },
          },
        },
        ColorProduct: {
          select: {
            Colors: { select: { name: true } },
          },
        },
        ImageProduct: {
          select: { image_url: true },
        },
        Categories: { select: { name: true } },
      },
    });
    if (isNaN(req.params.id)) {
      res.status(400).json({ message: "Invalid ID" });
    } else if (!product) {
      res.status(404).json({ message: "Product Not Found" });
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/product/:id", authorizePermission(Permission.EDIT_PRODUCT), upload.single("image"), async (req, res) => {
  const { category_id, name, price, quantity, description } = req.body;
  const user = await prisma.tokens.findFirst({ where: { token: req.headers.authorization } });
  try {
    const product = await prisma.products.update({
      where: { id: +req.params.id },
      data: {
        name: name,
      },
    });
    const sizeId = await prisma.productSize.findFirst({ where: { product_id: product.id } });
    await prisma.productSize.update({
      where: {
        product_id_size_id: {
          product_id: product.id,
          size_id: sizeId.size_id,
        },
      },
      data: req.body,
    });
    const colorId = await prisma.colorProduct.findFirst({ where: { product_id: product.id } });
    await prisma.colorProduct.update({
      where: {
        product_id_color_id: {
          product_id: product.id,
          color_id: colorId.color_id,
        },
      },
      data: req.body,
    });
    const oldImage = await prisma.imageProduct.findFirst({ where: { product_id: +req.params.id } });
    if (oldImage && req.file) {
      await prisma.imageProduct.delete({ where: { product_id: +req.params.id } });
    }
    const image_url = req.file ? `${req.protocol}://${req.get("host")}/public/images/${req.file.filename}` : "https://example.com/default-image.png";
    await prisma.imageProduct.create({
      data: {
        product_id: +product.id,
        image_url: image_url,
      },
    });
    res.status(200).json({ message: "Updated Data Product successfully", product });
  } catch (error) {
    console.log("Error saat menyimpan data: ", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
