import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const seedCategories = async () => {
  try {
    await prisma.categories.createMany({
      data: [{ name: "Kemeja" }, { name: "Baju" }, { name: "Celana Panjang" }, { name: "Celana Pendek" }, { name: "Jaket" }],
    });
  } catch (error) {
    console.log("Error seeding data categories : ", error);
  }
};

seedCategories();
