import { computed, effect, inject, signal } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import {
  patchState,
  signalStore,
  watchState,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { CategoryFacade } from '../../data-access/category/facades/category.facade';
import { Router } from '@angular/router';
import {CategoryModel, CategoryViewModel} from "../../../libs/data-access/todo";

type CategoryListState = {
  categoriesViewModel: CategoryViewModel;
  isDrafting: boolean;
};

const initialState: CategoryListState = {
  categoriesViewModel: {
    categories: [],
  },
  isDrafting: false,
};

const _refresherEvent = signal<RefresherCustomEvent | null>(null);

export const CategoryListStore = signalStore(
  // declare state
  withState(initialState),

  // grouping dependencies
  withProps(() => ({
    categoryFacade: inject(CategoryFacade),
    router: inject(Router),
  })),

  // computed state
  withComputed(({ categoryFacade }) => ({
    $showLoading: computed(
      () => categoryFacade.$isLoading() && _refresherEvent() === null
    ),
  })),

  withHooks(({ categoryFacade, ...store }) => ({
    onInit() {
      // extract a view model from facade
      effect(() =>
        patchState(store, {
          categoriesViewModel: categoryFacade.$categoriesViewModel(),
        })
      );

      // complete refresh when complete fetch categories
      effect(() => {
        if (!categoryFacade.$isLoading() && _refresherEvent()) {
          void _refresherEvent()?.target.complete();
          _refresherEvent.set(null);
        }
      });

      // logging state
      watchState(store, (state) => {
        console.debug('[watchState] CategoryListPageState', state);
      });
    },
  })),

  withMethods(({ categoryFacade, router, ...store }) => ({
    onRefreshed: (event: RefresherCustomEvent) => {
      _refresherEvent.set(event);
      categoryFacade.fetchCategories();
    },

    onIsDraftingToggled: (value: boolean) =>
      patchState(store, { isDrafting: value }),

    onCompleteClicked: () => patchState(store, { isDrafting: false }),

    onCategorySelected: (categoryId: number) =>
      void router.navigate(['/category', categoryId, 'todos']),

    onCategoryAdded: (category: CategoryModel) => {
      categoryFacade.addCategory(category);
      patchState(store, { isDrafting: false });
    },

    onCategoryDeleted: (category: CategoryModel) =>
      categoryFacade.deleteCategory(category.id),
  }))
);
