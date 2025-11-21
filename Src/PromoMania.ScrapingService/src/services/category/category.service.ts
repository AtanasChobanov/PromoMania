import prisma from "../../config/prisma-client.config.js";

export default class CategoryService {
  async getOrCreateCategory(name: string) {
    let category = await prisma.category.findFirst({
      where: { name },
    });

    if (!category) {
      category = await prisma.category.create({
        data: { name },
      });
    }

    return category;
  }
}
