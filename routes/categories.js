import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authToken, authorizePermission } from "../authenticate_token.js";
import { Permission } from "../authorization.js";

const prisma = new PrismaClient();
const router = Router();

router.use(authToken);

router.get("/categories", authorizePermission(Permission.BROWSE_CATEGORIES), async (req, res) => {
  try {
    const categories = await prisma.categories.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/category/:id", authorizePermission(Permission.READ_CATEGORIES), async (req, res) => {
  try {
    const category = await prisma.categories.findFirst({ where: { id: +req.params.id } });
    if (isNaN(req.params.id)) {
      res.status(400).json({ message: "Invalid ID" });
    } else if (!category) {
      res.status(404).json({ message: "Category Not Found" });
    } else {
      res.status(200).json({ message: "Data Category : ", category });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
