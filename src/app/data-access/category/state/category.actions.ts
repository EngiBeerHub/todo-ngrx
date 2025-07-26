import { createAction, props } from '@ngrx/store';
import {CategoryModel} from "../../../../libs/data-access/todo";

export const resetCategoriesState = createAction(`[Categories] Reset state`);
export const addCategory = createAction(
  `[Category] Add Category`,
  props<{ category: CategoryModel }>()
);
export const addCategorySuccess = createAction(
  `[Category] Add Category Success`,
  props<{ category: CategoryModel }>()
);
export const addCategoryFailed = createAction(`[Category] Add Category Failed`);

export const getCategory = createAction(
  `[Category] Get Category`,
  props<{ id: number }>()
);
export const getCategorySuccess = createAction(
  `[Category] Get Category Success`,
  props<{ category: CategoryModel }>()
);
export const getCategoryFailed = createAction(`[Category] Get Category Failed`);

export const fetchCategories = createAction(`[Categories] Fetch Categories`);
export const fetchCategoriesSuccess = createAction(
  `[Categories] Fetch Categories Success`,
  props<{ categories: CategoryModel[] }>()
);
export const fetchCategoriesFailed = createAction(
  `[Categories] Fetch Categories Failed`
);

export const updateCategory = createAction(
  `[Category] Update Category`,
  props<{ category: CategoryModel }>()
);
export const updateCategorySuccess = createAction(
  `[Category] Update Category Success`,
  props<{ category: CategoryModel }>()
);
export const updateCategoryFailed = createAction(
  `[Category] Update Category Failed`
);

export const deleteCategory = createAction(
  `[Category] Delete Category`,
  props<{ id: number }>()
);
export const deleteCategorySuccess = createAction(
  `[Category] Delete Category Success`,
  props<{ id: number }>()
);
export const deleteCategoryFailed = createAction(
  `[Category] Delete Category Failed`
);
