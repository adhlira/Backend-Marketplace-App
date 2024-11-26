import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Permission } from "../authorization.js";
import { authToken, authorizePermission } from "../authenticate_token.js";
import upload from "../multer_config.js";
import fs from "fs/promises";
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

router.post("/product", upload.array("images", 9), authorizePermission(Permission.ADD_PRODUCT), async (req, res) => {
  const { category_id, name, price, quantity, description, sizes, colors } = req.body;
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

    const sizesArray = JSON.parse(sizes);
    const colorsArray = JSON.parse(colors);

    const productSizes = sizesArray.map((size_id) => ({ product_id: +product.id, size_id }));
    await prisma.productSize.createMany({ data: productSizes });

    const colorsProduct = colorsArray.map((color_id) => ({ product_id: +product.id, color_id }));
    await prisma.colorProduct.createMany({ data: colorsProduct });

    req.files.map(async (file) => {
      await prisma.imageProduct.createMany({
        data: {
          product_id: product.id,
          image_url: file.filename,
        },
      });
    });
    res.status(200).json({ message: "Added Data Product successfully", product });
  } catch (error) {
    console.log("Error saat menyimpan data: ", error);
    res.status(500).json({ error: error.message });
  }

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
});

router.put("/product/:id", authorizePermission(Permission.EDIT_PRODUCT), upload.array("images", 9), async (req, res) => {
  const { category_id, name, price, quantity, description, sizes, colors } = req.body;
  try {
    const productExist = await prisma.products.findUnique({ where: { id: Number(req.params.id) } });
    if (!productExist) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await prisma.products.update({
      where: { id: +req.params.id },
      data: {
        name: name,
        category_id: +category_id,
        price: +price,
        quantity: +quantity,
        description: description,
      },
    });

    if (sizes) {
      const sizesArray = JSON.parse(sizes);
      await prisma.productSize.deleteMany({ where: { product_id: +req.params.id } });
      const productSize = sizesArray.map((size_id) => ({
        product_id: Number(req.params.id),
        size_id: Number(size_id),
      }));
      await prisma.productSize.createMany({ data: productSize });
    }

    if (colors) {
      const colorsArray = JSON.parse(colors);
      await prisma.colorProduct.deleteMany({ where: { product_id: +req.params.id } });
      const colorsProduct = colorsArray.map((color_id) => ({
        product_id: Number(req.params.id),
        color_id: Number(color_id),
      }));
      await prisma.colorProduct.createMany({ data: colorsProduct });
    }

    if (req.files && req.files.length > 0) {
      const oldImage = await prisma.imageProduct.findMany({ where: { product_id: Number(req.params.id) } });
      oldImage.forEach((image) => {
        const imagePath = path.join("public", "images", image.image_url);
        fs.unlink(imagePath);
      });

      await prisma.imageProduct.deleteMany({ where: { product_id: Number(req.params.id) } });
      const imageUrl = req.files.map((file) => file.filename);
      const imageProduct = imageUrl.map((image_url) => ({
        product_id: Number(req.params.id),
        image_url: image_url,
      }));
      await prisma.imageProduct.createMany({ data: imageProduct });
    }
    res.status(200).json({ message: "Updated Data Product successfully", product });
  } catch (error) {
    console.log("Error saat menyimpan data: ", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/products/user", authorizePermission(Permission.BROWSE_PRODUCT), async (req, res) => {
  const user = await prisma.tokens.findFirst({ where: { token: req.headers.authorization } });
  try {
    const products = await prisma.products.findMany({
      where: { user_id: user.user_id },
      include: {
        ColorProduct: {
          select: {
            Colors: {
              select: { name: true },
            },
          },
        },
        ProductSize: {
          select: {
            Sizes: {
              select: { name: true },
            },
          },
        },
        ImageProduct: {
          select: { image_url: true },
        },
      },
    });
    if (products.length == 0) {
      res.status(404).json({ message: "Data Product is empty" });
    } else {
      res.status(200).json({ message: "Data Product : ", products });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/products-category/:id", authorizePermission(Permission.BROWSE_PRODUCT), async (req, res) => {
  const id = +req.params.id;
  try {
    const products = await prisma.products.findMany({
      where: { category_id: id },
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
      },
    });
    if (isNaN(id)) {
      res.status(400).json({ message: "Category ID Invalid" });
    } else if (products.length == 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.status(200).json({ message: "Data Product : ", products });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/product/:id", authorizePermission(Permission.DELETE_PRODUCT), async (req, res) => {
  try {
    const product = await prisma.products.findFirst({ where: { id: +req.params.id } });

    await prisma.productSize.deleteMany({ where: { product_id: product.id } });
    await prisma.colorProduct.deleteMany({ where: { product_id: product.id } });

    const oldImage = await prisma.imageProduct.findMany({ where: { product_id: product.id } });
    oldImage.forEach((image) => {
      const imagePath = path.join("public", "images", image.image_url);
      fs.unlink(imagePath);
    })
    await prisma.imageProduct.deleteMany({ where: { product_id: product.id } });

    await prisma.products.delete({ where: { id: +req.params.id } });
    res.status(200).json({ message: "Data product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
