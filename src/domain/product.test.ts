import { describe, it, expect } from 'vitest';
import { createProduct, ProductError } from './product';

describe('createProduct', () => {
  describe('valid product creation', () => {
    it('should create a product with valid parameters', () => {
      // Arrange
      const params = {
        id: 'prod-123',
        name: 'Test Product',
        quantity: 25,
        loanDays: 2,
        description: 'A great test product',
        updatedAt: new Date('2025-01-01'),
      };

      // Act
      const product = createProduct(params);

      // Assert
      expect(product).toEqual(params);
    });

    // TODO: Additional valid creation tests can be added here (e.g. check zero price)
  });

  describe('id validation', () => {
    it('should throw ProductError when id is only whitespace', () => {
      // Arrange
      const params = {
        id: '   ',
        name: 'Test Product',
        quantity: 20,
        loanDays: 2,
        description: 'A test product',
        updatedAt: new Date(),
      };

      // Act
      const act = () => createProduct(params);

      // Assert
      expect(act).toThrow(ProductError);
    });

    // TODO: Additional validation tests can be added here
  });
});
