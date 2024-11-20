import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const colorSeeder = async () => {
  try {
    for (let i = 0; i < 20; i++) {
      const colorName = faker.color.human();
      const nameExist = await prisma.colors.findFirst({ where: { name: colorName } });
      if (nameExist) {
        break;
      } else {
        await prisma.colors.create({
          data: { name: colorName },
        });
      }
    }
  } catch (error) {
    console.log("Error seeding data : ", error);
  }
};

colorSeeder();
