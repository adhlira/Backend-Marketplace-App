import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seederSize = async () => {
  try {
    await prisma.sizes.createMany({
      data: [{ name: "S" }, { name: "M" }, { name: "L" }, { name: "XL" }, { name: "XXL" }],
    });
  } catch (error) {
    console.log("Error seeding data : ", error);
  }
};

seederSize();
