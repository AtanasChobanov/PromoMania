import prisma from "../../config/prisma-client.config.js";

export default class StoreChainService {
  async getStoreChain(chainName: string) {
    const storeChain = await prisma.storeChain.findFirst({
      where: { name: chainName },
    });

    return storeChain;
  }
}
