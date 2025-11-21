export default class BatchHelper {
  private static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  static async processInBatches<T, R>(
    items: T[],
    batchSize: number,
    concurrency: number,
    delayBetweenBatchesMs: number,
    handler: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const chunks = this.chunkArray(items, batchSize);
    const results: R[] = [];

    for (let i = 0; i < chunks.length; i += concurrency) {
      const current = chunks.slice(i, i + concurrency);
      const batchResults = await Promise.all(current.map(handler));
      results.push(...batchResults.flat());

      if (i + concurrency < chunks.length) {
        console.log(
          `⏳ Waiting ${delayBetweenBatchesMs}ms before next batch...`
        );
        await BatchHelper.sleep(delayBetweenBatchesMs);
      }
    }

    return results;
  }
}
