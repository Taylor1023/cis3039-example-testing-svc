import { getProductRepo } from '../config/appServices';
import { testProducts } from './test-products';

async function main(): Promise<void> {
  const repo = getProductRepo();

  for (const product of testProducts) {
    await repo.save(product);
    console.log(`Seeded product ${product.id}`);
  }

  console.log('Completed seeding products.');
}

main().catch((error) => {
  console.error('Failed to seed products', error);
  process.exitCode = 1;
});
