import { ListProductsDeps } from '../app/list-products';
import { UpsertProductDeps } from '../app/upsert-product';
import { ProductRepo } from '../domain/product-repo';
import { CosmosProductRepo } from '../infra/cosmos-product-repo';

const COSMOS_OPTIONS = {
  endpoint: 'https://loaning-dev-tf02-cosmos.documents.azure.com:443/',
  databaseId: 'catalogue-db',
  containerId: 'loanitems',
  key: process.env.COSMOS_KEY,
};

let cachedProductRepo: ProductRepo | null = null;

export const getProductRepo = (): ProductRepo => {
  if (!cachedProductRepo) {
    cachedProductRepo = new CosmosProductRepo(COSMOS_OPTIONS);
  }
  return cachedProductRepo;
};

export const createListProductsDeps = (): ListProductsDeps => ({
  productRepo: getProductRepo(),
});

export const makeUpsertProductDeps = (): UpsertProductDeps => ({
  productRepo: getProductRepo(),
  now: () => new Date(),
});
