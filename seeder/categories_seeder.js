import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const seedCategories = async () => {
  try {
    await prisma.categories.createMany({
      data: [{ name: "Kemeja" }, { name: "Celana Panjang" }, { name: "Jaket" }, { name: "Rok" }, { name: "Kaos" }, { name: "Sepatu" }, { name: "Tas" }, { name: "Aksesoris" }, { name: "Topi" }, { name: "Sweater" }],
    });
  } catch (error) {
    console.log("Error seeding data categories : ", error);
  }
};

seedCategories();
