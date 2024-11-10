import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const secret_key = "unitedfansclub"

  const user = await prisma.users.findUnique({ where: { email: email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Email atau Password salah" });
  }

  try {
    const expiresIn = "8h";
    const expiredAt = new Date(Date.now() + 60 * 480 * 1000);

    const token = jwt.sign({ user_id: user.id }, secret_key, { expiresIn });
    await prisma.tokens.create({
      data: {
        user_id: user.id,
        token: token,
        expired_at: expiredAt,
      },
    });
    return res.json({ token, expiredAt, user });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

export default router;
