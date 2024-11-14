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
    // if (req.files && req.files.length > 0) {
    //   await Promise.all(
    //     req.files.map(async (file, index) => {
    //       let fileName;
    //       switch (+category_id) {
    //         case 1:
    //           fileName = `product_${product.id}_${index}.jpg`;
    //           break;
    //         case 2:
    //           fileName = `product_${product.id}_w_${index}.jpg`;
    //           break;
    //         case 3:
    //           fileName = `product_${product.id}_k_${index}.jpg`;
    //           break;
    //         case 4:
    //           fileName = `cp${product.id}_${index}.jpg`;
    //           break;
    //         default:
    //           fileName = ""; // handle the default case appropriately
    //           break;
    //       }

    //       await tx.productImage.createMany({
    //         data: {
    //           product_id: product.id,
    //           image_url: image_url,
    //         },
    //       });

    //       const newPath = path.join("public/images", fileName);
    //       fs.renameSync(file.path, newPath);
    //     })
    //   );
    // }
  } catch (error) {
    console.log("Error saat menyimpan data: ", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
