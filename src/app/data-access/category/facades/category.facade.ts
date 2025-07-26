import { computed, inject, Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { CategoryActions, CategorySelectors } from '../state';
import { toSignal } from '@angular/core/rxjs-interop';
import {CategoryModel, CategoryViewModel, ICategoryFacade} from "../../../../libs/data-access/todo";

@Injectable({
  providedIn: 'root',
})
export class CategoryFacade implements ICategoryFacade {
  protected readonly store = inject(Store);

  private $_categoriesSignal = toSignal(
    this.store.select(CategorySelectors.selectAllCategories),
    { initialValue: [] }
  );

  $categoriesViewModel = computed<CategoryViewModel>(() => ({
    categories: this.$_categoriesSignal(),
  }));

  $isLoading = toSignal(this.store.select(CategorySelectors.selectIsLoading), {
    initialValue: false,
  });

  resetCategoriesState(): void {
    this.store.dispatch(CategoryActions.resetCategoriesState());
  }

  addCategory(category: CategoryModel): void {
    if (!category.title) return;

    const maxId = Math.max(
      0,
      ...this.$_categoriesSignal().map((category) => category.id!)
    );
    category.id = maxId + 1;
    this.store.dispatch(CategoryActions.addCategory({ category }));
  }

  fetchCategories(): void {
    this.store.dispatch(CategoryActions.fetchCategories());
  }

  getCategory(id: number): void {
    this.store.dispatch(CategoryActions.getCategory({ id }));
  }

  updateCategory(category: CategoryModel): void {
    if (!category.id) throw new Error('category.id is null.');
    if (category.title)
      this.store.dispatch(CategoryActions.updateCategory({ category }));
  }

  deleteCategory(id: number | null): void {
    if (!id) throw new Error('category.id is null.');
    this.store.dispatch(CategoryActions.deleteCategory({ id }));
  }
}
