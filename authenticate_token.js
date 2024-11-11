import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authToken = async (req, res, next) => {
  console.log(req.head);
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Token is required",
    });
  }

  const validToken = await prisma.tokens.findUnique({
    where: { token },
    include: {
      Users: {
        select: {
          id: true,
          role_id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!validToken) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  if (validToken.expired_at < new Date()) {
    return res.status(401).json({
      message: "Expired token",
    });
  }

  req.user = validToken.Users;

  next();
};

export const authorizePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const permissionRecords = await prisma.permissionRole.findMany({
      where: { role_id: req.user.role_id },
      include: { Permissions: true },
    });

    const permissions = permissionRecords.map((record) => record.Permissions.name);

    console.log("looking for permission", permission);
    console.log("in permissions", permissions);

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
};
