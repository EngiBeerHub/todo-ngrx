import { Signal } from '@angular/core';
import { CategoryModel, CategoryViewModel } from '../model/category.interfaces';

export interface ICategoryFacade {
  $categoriesViewModel: Signal<CategoryViewModel>;
  $isLoading: Signal<boolean>;
  resetCategoriesState(): void;
  addCategory(category: CategoryModel): void;
  fetchCategories(): void;
  getCategory(id: number): void;
  updateCategory(category: CategoryModel): void;
  deleteCategory(id: number): void;
}
