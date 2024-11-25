import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seederPermission = async () => {
  try {
    await prisma.permissions.createMany({
      data: [
        { name: "browse categories" },
        { name: "add product" },
        { name: "browse product" },
        { name: "read product" },
        { name: "edit product" },
        { name: "delete product" },
        { name: "browse cart" },
        { name: "add cart" },
        { name: "edit cart" },
        { name: "delete cart" },
      ],
    });
  } catch (error) {
    console.log("Error seeding data permissions : ", error);
  }
};

seederPermission();
