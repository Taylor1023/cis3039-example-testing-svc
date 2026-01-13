import { CosmosClient, Container } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import type { TokenCredential } from '@azure/core-auth';
import { Product } from '../domain/product';
import { ProductRepo } from '../domain/product-repo';

type CosmosProductDocument = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  loanDays: number;
  updatedAt: string;
};

export type CosmosProductRepoOptions = {
  endpoint: string;
  databaseId: string;
  containerId: string;
  credential?: TokenCredential;
  cosmosClient?: CosmosClient;
  key?: string;
};

export class CosmosProductRepo implements ProductRepo {
  private readonly container: Container;

  constructor(options: CosmosProductRepoOptions) {
    if (!options) {
      throw new Error('CosmosProductRepo requires options');
    }

    const { endpoint, databaseId, containerId, key } = options;

    if (!endpoint) {
      throw new Error('CosmosProductRepo requires an endpoint option');
    }

    if (!databaseId) {
      throw new Error('CosmosProductRepo requires a databaseId option');
    }

    if (!containerId) {
      throw new Error('CosmosProductRepo requires a containerId option');
    }

    const cosmosClient =
      options.cosmosClient ??
      new CosmosClient(
        key
          ? {
              endpoint,
              key,
            }
          : {
              endpoint,
              aadCredentials:
                options.credential ?? new DefaultAzureCredential(),
            }
      );

    this.container = cosmosClient.database(databaseId).container(containerId);
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const { resource } = await this.container
        .item(id)
        .read<CosmosProductDocument>();

      if (!resource) {
        return null;
      }

      return this.mapToDomain(resource);
    } catch (error) {
      if (this.isNotFound(error)) {
        return null;
      }

      throw this.wrapError('Unable to get product', error);
    }
  }

  async list(): Promise<Product[]> {
    try {
      const { resources } = await this.container.items
        .readAll<CosmosProductDocument>()
        .fetchAll();

      return (resources ?? []).map((resource) => this.mapToDomain(resource));
    } catch (error) {
      throw this.wrapError('Unable to list products', error);
    }
  }

  async save(product: Product): Promise<Product> {
    const document = this.mapToDocument(product);

    try {
      const { resource } =
        await this.container.items.upsert<CosmosProductDocument>(document);

      if (!resource) {
        throw new Error('No resource returned from Cosmos DB upsert');
      }

      return this.mapToDomain(resource);
    } catch (error) {
      throw this.wrapError('Unable to save product', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.container.item(id).delete();
    } catch (error) {
      if (this.isNotFound(error)) {
        return;
      }

      throw this.wrapError('Unable to delete product', error);
    }
  }

  private mapToDomain(document: CosmosProductDocument): Product {
    const updatedAt = new Date(document.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) {
      throw new Error(
        `Invalid updatedAt value from Cosmos DB: ${document.updatedAt}`
      );
    }

    return {
      id: document.id,
      name: document.name,
      description: document.description,
      quantity: document.quantity,
      loanDays: document.loanDays,
      updatedAt,
    };
  }

  private mapToDocument(product: Product): CosmosProductDocument {
    if (!(product.updatedAt instanceof Date)) {
      throw new Error(
        'Product.updatedAt must be a Date instance before persisting'
      );
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      loanDays: product.loanDays,
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private isNotFound(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const statusCode = (error as { statusCode?: number }).statusCode;
    const code = (error as { code?: number | string }).code;

    return (
      statusCode === 404 ||
      code === 404 ||
      code === 'NotFound' ||
      code === 'ResourceNotFound'
    );
  }

  private wrapError(message: string, error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`${message}: ${error.message}`);
    }

    return new Error(`${message}: ${String(error)}`);
  }
}
