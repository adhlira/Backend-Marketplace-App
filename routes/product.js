import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

router.get("/products", async (req, res) => {
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

router.post("/product", async (req, res) => {
     
})

export default router;
