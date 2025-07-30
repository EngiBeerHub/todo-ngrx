import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {toSignal} from '@angular/core/rxjs-interop';
import {CategoryActions, CategorySelectors} from './index';
import {catchError, concatMap, map, of, switchMap} from 'rxjs';
import {CategoryHttpService, CategoryModel} from "../../../../libs/data-access/todo";

@Injectable({
  providedIn: 'root',
})
export class CategoryEffects {
  private readonly actions = inject(Actions);
  private readonly categoryApi = inject(CategoryHttpService);
  protected readonly store = inject(Store);

  private $_categorySignal = toSignal(
    this.store.select(CategorySelectors.selectAllCategories),
    { initialValue: [] }
  );

  addCategory$ = createEffect(() =>
    this.actions.pipe(
      ofType(CategoryActions.addCategory.type),
      concatMap(({ category }) =>
        this.categoryApi.post(category).pipe(
          map((category: CategoryModel) =>
            CategoryActions.addCategorySuccess({ category })
          ),
          catchError(() => of(CategoryActions.addCategoryFailed()))
        )
      )
    )
  );

  fetchCategories$ = createEffect(() =>
    this.actions.pipe(
      ofType(CategoryActions.fetchCategories.type),
      switchMap(() =>
        this.categoryApi.get().pipe(
          map((categories: CategoryModel[]) =>
            CategoryActions.fetchCategoriesSuccess({ categories })
          ),
          catchError(() => of(CategoryActions.fetchCategoriesFailed()))
        )
      )
    )
  );

  getCategory$ = createEffect(() =>
    this.actions.pipe(
      ofType(CategoryActions.getCategory.type),
      switchMap(({ id }) => {
        const category = this.$_categorySignal().find(
          (category) => category.id === id
        );
        return category
          ? of(CategoryActions.getCategorySuccess({ category }))
          : this.categoryApi.getById(id).pipe(
              map((category: CategoryModel) =>
                CategoryActions.getCategorySuccess({ category })
              ),
              catchError(() => of(CategoryActions.getCategoryFailed()))
            );
      })
    )
  );

  getCategorySuccess$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(CategoryActions.getCategorySuccess.type),
        switchMap(({ category }) => of(category))
      ),
    { dispatch: false }
  );

  updateCategory$ = createEffect(() =>
    this.actions.pipe(
      ofType(CategoryActions.updateCategory.type),
      concatMap(({ category }) =>
        this.categoryApi.put(category.id, category).pipe(
          map((category: CategoryModel) =>
            CategoryActions.updateCategorySuccess({ category })
          ),
          catchError(() => of(CategoryActions.updateCategoryFailed()))
        )
      )
    )
  );

  deleteCategory$ = createEffect(() =>
    this.actions.pipe(
      ofType(CategoryActions.deleteCategory.type),
      concatMap(({ id }) =>
        this.categoryApi.delete(id).pipe(
          map((category: CategoryModel) =>
            CategoryActions.deleteCategorySuccess({ id: category.id as number })
          ),
          catchError(() => of(CategoryActions.deleteCategoryFailed()))
        )
      )
    )
  );
}
