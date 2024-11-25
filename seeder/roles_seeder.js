import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedRoles = async () => {
  try {
    await prisma.roles.createMany({
      data: [{ name: "Seller" }, { name: "Buyer" }],
    });
  } catch (error) {
    console.log("Error seeding data roles : ", error);
  }
};

seedRoles();
