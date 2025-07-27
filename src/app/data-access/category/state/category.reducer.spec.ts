import {categoryReducer, initialCategoriesState} from './category.reducer';
import {CategoryActions} from './index';
import {CategoriesState, CategoryModel} from '../../../../libs/data-access/todo';

describe('CategoryReducer', () => {
  const mockCategory1: CategoryModel = {
    id: 1,
    title: 'Work',
    description: 'Work related tasks',
    showDoneTodos: false,
  };

  const mockCategory2: CategoryModel = {
    id: 2,
    title: 'Personal',
    description: 'Personal tasks',
    showDoneTodos: true,
  };

  const mockCategory3: CategoryModel = {
    id: 3,
    title: 'Shopping',
    description: 'Shopping list',
    showDoneTodos: false,
  };

  const mockCategories: CategoryModel[] = [
    mockCategory1,
    mockCategory2,
    mockCategory3,
  ];

  describe('Initial State', () => {
    it('should return the initial state', () => {
      // Arrange
      const action = { type: 'Unknown' } as any;

      // Act
      const result = categoryReducer(undefined, action);

      // Assert
      expect(result).toBe(initialCategoriesState);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
    });

    it('should have correct initial state structure', () => {
      // Act & Assert
      expect(initialCategoriesState.isLoading).toBe(false);
      expect(initialCategoriesState.error).toBeNull();
      expect(initialCategoriesState.ids).toEqual([]);
      expect(initialCategoriesState.entities).toEqual({});
    });
  });

  describe('Reset Categories State', () => {
    it('should reset state to initial state', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1, 2],
        entities: {
          1: mockCategory1,
          2: mockCategory2,
        },
        isLoading: true,
        error: 'Some error',
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.resetCategoriesState()
      );

      // Assert
      expect(result).toEqual(initialCategoriesState);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
    });
  });

  describe('Add Category', () => {
    it('should add category optimistically', () => {
      // Act
      const result = categoryReducer(
        initialCategoriesState,
        CategoryActions.addCategory({ category: mockCategory1 })
      );

      // Assert
      expect(result.ids).toContain(mockCategory1.id);
      expect(result.entities[mockCategory1.id!]).toEqual(mockCategory1);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should add multiple categories', () => {
      // Arrange
      const firstState = categoryReducer(
        initialCategoriesState,
        CategoryActions.addCategory({ category: mockCategory1 })
      );

      // Act
      const result = categoryReducer(
        firstState,
        CategoryActions.addCategory({ category: mockCategory2 })
      );

      // Assert
      expect(result.ids).toEqual([1, 2]);
      expect(result.entities[mockCategory1.id!]).toEqual(mockCategory1);
      expect(result.entities[mockCategory2.id!]).toEqual(mockCategory2);
    });

    it('should handle addCategorySuccess', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.addCategorySuccess({ category: mockCategory1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle addCategoryFailed', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.addCategoryFailed()
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to add category!');
    });
  });

  describe('Fetch Categories', () => {
    it('should set loading to true when fetching categories', () => {
      // Act
      const result = categoryReducer(
        initialCategoriesState,
        CategoryActions.fetchCategories()
      );

      // Assert
      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle fetchCategoriesSuccess', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.fetchCategoriesSuccess({ categories: mockCategories })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.ids).toEqual([1, 2, 3]);
      expect(result.entities[1]).toEqual(mockCategory1);
      expect(result.entities[2]).toEqual(mockCategory2);
      expect(result.entities[3]).toEqual(mockCategory3);
    });

    it('should replace existing categories on fetchCategoriesSuccess', () => {
      // Arrange
      const existingCategory: CategoryModel = {
        id: 99,
        title: 'Existing',
        description: 'Existing category',
        showDoneTodos: false,
      };
      const currentState: CategoriesState = {
        ids: [99],
        entities: { 99: existingCategory },
        isLoading: true,
        error: null,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.fetchCategoriesSuccess({ categories: mockCategories })
      );

      // Assert
      expect(result.ids).toEqual([1, 2, 3]);
      expect(result.entities[99]).toBeUndefined();
      expect(result.entities[1]).toEqual(mockCategory1);
    });

    it('should handle fetchCategoriesFailed', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.fetchCategoriesFailed()
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to fetch categories!');
    });

    it('should handle empty categories array in fetchCategoriesSuccess', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1, 2],
        entities: {
          1: mockCategory1,
          2: mockCategory2,
        },
        isLoading: true,
        error: null,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.fetchCategoriesSuccess({ categories: [] })
      );

      // Assert
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('Update Category', () => {
    it('should update existing category', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1, 2],
        entities: {
          1: mockCategory1,
          2: mockCategory2,
        },
        isLoading: false,
        error: null,
      };

      const updatedCategory: CategoryModel = {
        ...mockCategory1,
        title: 'Updated Work',
        description: 'Updated work description',
        showDoneTodos: true,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.updateCategory({ category: updatedCategory })
      );

      // Assert
      expect(result.entities[1]).toEqual(updatedCategory);
      expect(result.entities[2]).toEqual(mockCategory2);
      expect(result.ids).toEqual([1, 2]);
    });

    it('should not update when category id is null', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1],
        entities: { 1: mockCategory1 },
        isLoading: false,
        error: null,
      };

      const categoryWithoutId: CategoryModel = {
        id: null,
        title: 'Category without ID',
        description: 'Description',
        showDoneTodos: false,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.updateCategory({ category: categoryWithoutId })
      );

      // Assert
      expect(result).toBe(currentState);
      expect(result.entities[1]).toEqual(mockCategory1);
    });

    it('should not update non-existing category', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1],
        entities: { 1: mockCategory1 },
        isLoading: false,
        error: null,
      };

      const nonExistingCategory: CategoryModel = {
        id: 999,
        title: 'Non-existing',
        description: 'Does not exist',
        showDoneTodos: false,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.updateCategory({ category: nonExistingCategory })
      );

      // Assert
      expect(result.entities[999]).toBeUndefined();
      expect(result.entities[1]).toEqual(mockCategory1);
      expect(result.ids).toEqual([1]);
    });

    it('should handle updateCategorySuccess', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.updateCategorySuccess({ category: mockCategory1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle updateCategoryFailed', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.updateCategoryFailed()
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to update category!');
    });
  });

  describe('Delete Category', () => {
    it('should delete existing category', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1, 2, 3],
        entities: {
          1: mockCategory1,
          2: mockCategory2,
          3: mockCategory3,
        },
        isLoading: false,
        error: null,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.deleteCategory({ id: 2 })
      );

      // Assert
      expect(result.ids).toEqual([1, 3]);
      expect(result.entities[2]).toBeUndefined();
      expect(result.entities[1]).toEqual(mockCategory1);
      expect(result.entities[3]).toEqual(mockCategory3);
    });

    it('should handle deleting non-existing category', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1, 2],
        entities: {
          1: mockCategory1,
          2: mockCategory2,
        },
        isLoading: false,
        error: null,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.deleteCategory({ id: 999 })
      );

      // Assert
      expect(result.ids).toEqual([1, 2]);
      expect(result.entities[1]).toEqual(mockCategory1);
      expect(result.entities[2]).toEqual(mockCategory2);
    });

    it('should delete last remaining category', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1],
        entities: { 1: mockCategory1 },
        isLoading: false,
        error: null,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.deleteCategory({ id: 1 })
      );

      // Assert
      expect(result.ids).toEqual([]);
      expect(result.entities).toEqual({});
    });

    it('should handle deleteCategorySuccess', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
        error: 'Previous error',
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.deleteCategorySuccess({ id: 1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle deleteCategoryFailed', () => {
      // Arrange
      const currentState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.deleteCategoryFailed()
      );

      // Assert
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Failed to delete category!');
    });
  });

  describe('Error State Management', () => {
    it('should clear error on successful operations', () => {
      // Arrange
      const stateWithError: CategoriesState = {
        ...initialCategoriesState,
        error: 'Previous error',
      };

      // Act
      const result = categoryReducer(
        stateWithError,
        CategoryActions.addCategorySuccess({ category: mockCategory1 })
      );

      // Assert
      expect(result.error).toBeNull();
    });

    it('should preserve entities when setting error', () => {
      // Arrange
      const currentState: CategoriesState = {
        ids: [1, 2],
        entities: {
          1: mockCategory1,
          2: mockCategory2,
        },
        isLoading: true,
        error: null,
      };

      // Act
      const result = categoryReducer(
        currentState,
        CategoryActions.fetchCategoriesFailed()
      );

      // Assert
      expect(result.entities[1]).toEqual(mockCategory1);
      expect(result.entities[2]).toEqual(mockCategory2);
      expect(result.ids).toEqual([1, 2]);
      expect(result.error).toBe('Failed to fetch categories!');
    });
  });

  describe('Loading State Management', () => {
    it('should set loading to true for async operations', () => {
      // Act
      const result = categoryReducer(
        initialCategoriesState,
        CategoryActions.fetchCategories()
      );

      // Assert
      expect(result.isLoading).toBe(true);
    });

    it('should set loading to false on success operations', () => {
      // Arrange
      const loadingState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
      };

      // Act
      const result = categoryReducer(
        loadingState,
        CategoryActions.updateCategorySuccess({ category: mockCategory1 })
      );

      // Assert
      expect(result.isLoading).toBe(false);
    });

    it('should set loading to false on failed operations', () => {
      // Arrange
      const loadingState: CategoriesState = {
        ...initialCategoriesState,
        isLoading: true,
      };

      // Act
      const result = categoryReducer(
        loadingState,
        CategoryActions.deleteCategoryFailed()
      );

      // Assert
      expect(result.isLoading).toBe(false);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state when adding category', () => {
      // Arrange
      const originalState = initialCategoriesState;

      // Act
      const result = categoryReducer(
        originalState,
        CategoryActions.addCategory({ category: mockCategory1 })
      );

      // Assert
      expect(result).not.toBe(originalState);
      expect(originalState.ids).toEqual([]);
      expect(originalState.entities).toEqual({});
    });

    it('should not mutate original state when updating category', () => {
      // Arrange
      const originalState: CategoriesState = {
        ids: [1],
        entities: { 1: mockCategory1 },
        isLoading: false,
        error: null,
      };

      const updatedCategory = { ...mockCategory1, title: 'Updated' };

      // Act
      const result = categoryReducer(
        originalState,
        CategoryActions.updateCategory({ category: updatedCategory })
      );

      // Assert
      expect(result).not.toBe(originalState);
      expect(originalState.entities[1]?.title).toBe('Work');
      expect(result.entities[1]?.title).toBe('Updated');
    });

    it('should not mutate original state when deleting category', () => {
      // Arrange
      const originalState: CategoriesState = {
        ids: [1, 2],
        entities: {
          1: mockCategory1,
          2: mockCategory2,
        },
        isLoading: false,
        error: null,
      };

      // Act
      const result = categoryReducer(
        originalState,
        CategoryActions.deleteCategory({ id: 1 })
      );

      // Assert
      expect(result).not.toBe(originalState);
      expect(originalState.ids).toEqual([1, 2]);
      expect(originalState.entities[1]).toEqual(mockCategory1);
      expect(result.ids).toEqual([2]);
      expect(result.entities[1]).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined state gracefully', () => {
      // Act
      const result = categoryReducer(
        undefined,
        CategoryActions.addCategory({ category: mockCategory1 })
      );

      // Assert
      expect(result.ids).toContain(mockCategory1.id);
      expect(result.entities[mockCategory1.id!]).toEqual(mockCategory1);
    });

    it('should handle category with zero id', () => {
      // Arrange
      const categoryWithZeroId: CategoryModel = {
        id: 0,
        title: 'Zero ID Category',
        description: 'Category with zero ID',
        showDoneTodos: false,
      };

      // Act
      const result = categoryReducer(
        initialCategoriesState,
        CategoryActions.addCategory({ category: categoryWithZeroId })
      );

      // Assert
      expect(result.ids).toContain(0);
      expect(result.entities[0]).toEqual(categoryWithZeroId);
    });

    it('should handle category with negative id', () => {
      // Arrange
      const categoryWithNegativeId: CategoryModel = {
        id: -1,
        title: 'Negative ID Category',
        description: 'Category with negative ID',
        showDoneTodos: false,
      };

      // Act
      const result = categoryReducer(
        initialCategoriesState,
        CategoryActions.addCategory({ category: categoryWithNegativeId })
      );

      // Assert
      expect(result.ids).toContain(-1);
      expect(result.entities[-1]).toEqual(categoryWithNegativeId);
    });
  });
});
