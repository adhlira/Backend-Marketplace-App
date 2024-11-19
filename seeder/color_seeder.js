import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const colorSeeder = async () => {
  try {
     const uniqueValues = new Set();
     while (uniqueValues.size < 5) {
       await prisma.colors.createMany({
         data: {
           name: faker.color.human(),
         },
       });
       // uniqueValues.add(faker.commerce.product());
     }
  } catch (error) {
    console.log("Error seeding data : ", error);
  }
};

colorSeeder();
