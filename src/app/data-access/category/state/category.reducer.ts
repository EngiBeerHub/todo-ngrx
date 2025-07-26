import { createReducer, on } from '@ngrx/store';
import { CategoryActions } from './index';
import { categoryEntityAdapter } from './category.entity';
import {CategoriesState} from "../../../../libs/data-access/todo";

export const initialCategoriesState = categoryEntityAdapter.getInitialState({
  isLoading: false,
  error: null,
});

export const categoryReducer = createReducer<CategoriesState>(
  initialCategoriesState,
  on(CategoryActions.resetCategoriesState, () => initialCategoriesState),
  on(CategoryActions.addCategory, (state, { category }) =>
    // optimistically update state
    categoryEntityAdapter.addOne(category, state)
  ),
  on(CategoryActions.addCategorySuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),
  on(CategoryActions.addCategoryFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to add category!',
  })),
  on(CategoryActions.fetchCategories, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(CategoryActions.fetchCategoriesSuccess, (state, { categories }) =>
    categoryEntityAdapter.setAll(categories, {
      ...state,
      isLoading: false,
      error: null,
    })
  ),
  on(CategoryActions.fetchCategoriesFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to fetch categories!',
  })),
  on(CategoryActions.updateCategory, (state, { category }) =>
    category.id
      ? categoryEntityAdapter.updateOne(
          { id: category.id, changes: category },
          state
        )
      : state
  ),
  on(CategoryActions.updateCategorySuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),
  on(CategoryActions.updateCategoryFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to update category!',
  })),
  on(CategoryActions.deleteCategory, (state, { id }) =>
    categoryEntityAdapter.removeOne(id, state)
  ),
  on(CategoryActions.deleteCategorySuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),
  on(CategoryActions.deleteCategoryFailed, (state) => ({
    ...state,
    isLoading: false,
    error: 'Failed to delete category!',
  }))
);
