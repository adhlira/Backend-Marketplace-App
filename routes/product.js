import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Permission } from "../authorization.js";
import { authToken, authorizePermission } from "../authenticate_token.js";

const prisma = new PrismaClient();
const router = Router();

router.use(authToken)

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

router.post("/product", authorizePermission(Permission.ADD_PRODUCT), async (req, res) => {
     const {category_id, name, price, quantity, description, size_id, color_id} = req.body
     try {
          
     } catch (error) {
          res.status(500).json({message:error})
     }
})

export default router;
