import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

router.post("/sign-up", async (req, res) => {
  const { name, email, password, address, phone_number, role_id } = req.body;
  try {
    if (!name || !email || !password || !address || !phone_number || !role_id) {
      return res.status(400).json({ message: "Data Incomplete" });
    } else {
      const new_user = await prisma.users.create({
        data: {
          role_id: role_id,
          name: name,
          email: email,
          password: bcrypt.hashSync(password, 4),
          address: address,
          phone_number: phone_number,
        },
      });
      return res.status(200).json({ message: "Created Data Successfully", new_user });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const user = await prisma.users.findUnique({ where: { id: +req.params.id } });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ message: "Data User", user });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.put("/user/:id", async (req, res) => {
  try {
    const user_updated = await prisma.users.update({ where: { id: +req.params.id }, data: req.body });
    return res.status(200).json({ message: "Updated Data Successfully", user_updated });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

export default router;
