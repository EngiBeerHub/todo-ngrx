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
import { computed, effect, inject, signal } from '@angular/core';
import { TodoFacade } from '../../data-access/todo/facades/todo.facade';
import { CategoryFacade } from '../../data-access/category/facades/category.facade';
import { AlertController } from '@ionic/angular/standalone';
import { RefresherCustomEvent } from '@ionic/angular';
import { Location } from '@angular/common';
import {TodoModel, TodosViewModel} from "../../../libs/data-access/todo";

type TodoListPageState = {
  todosViewModel: TodosViewModel;
  isDrafting: boolean;
  isUpdating: boolean;
  isOpenMenu: boolean;
};

const initialState: TodoListPageState = {
  todosViewModel: {
    category: null,
    showDoneTodos: false,
    todos: [],
  },
  isDrafting: false,
  isUpdating: false,
  isOpenMenu: false,
};

const _refresherEvent = signal<RefresherCustomEvent | null>(null);

export const TodoListStore = signalStore(
  // declare state
  withState(initialState),

  // grouping dependencies
  withProps(() => ({
    todoFacade: inject(TodoFacade),
    categoryFacade: inject(CategoryFacade),
    alertCtrl: inject(AlertController),
    location: inject(Location),
  })),

  // computed state
  withComputed(({ todoFacade }) => ({
    $showLoading: computed(
      () => todoFacade.$isLoading() && _refresherEvent() === null
    ),
  })),

  // lifecycle method of store
  withHooks(({ todoFacade, ...store }) => ({
    onInit() {
      // extract a view model from facade
      effect(() =>
        patchState(store, { todosViewModel: todoFacade.$todosViewModel() })
      );

      // complete refresh when complete fetch todos
      effect(() => {
        if (!todoFacade.$isLoading() && _refresherEvent()) {
          void _refresherEvent()?.target.complete();
          _refresherEvent.set(null);
        }
      });

      // logging state
      watchState(store, (state) => {
        console.debug('[watchState] TodoListPageState', state);
      });
    },
  })),

  // reducers and effects
  withMethods(
    ({ todoFacade, categoryFacade, alertCtrl, location, ...store }) => ({
      onRefreshed: (event: RefresherCustomEvent) => {
        _refresherEvent.set(event);
        todoFacade.fetchTodos();
      },

      onIsOpenMenuToggled: (value: boolean) =>
        patchState(store, { isOpenMenu: value }),

      onIsDraftingToggled: (value: boolean) =>
        patchState(store, { isDrafting: value }),

      onIsUpdatingToggled: (value: boolean) =>
        patchState(store, { isUpdating: value }),

      onCompleteClicked: () =>
        patchState(store, { isDrafting: false, isUpdating: false }),

      onTodoAdded: (todo: TodoModel) => {
        todoFacade.addTodo(todo);
        patchState(store, { isDrafting: false });
      },

      onTodoUpdated: (todo: TodoModel) => todoFacade.updateTodo(todo),

      onTodoDeleted: (todo: TodoModel) => todoFacade.deleteTodo(todo.id),

      onShowDoneTodosToggled: (value: boolean) =>
        categoryFacade.updateCategory({
          ...store.todosViewModel().category!,
          showDoneTodos: value,
        }),

      onDeleteCategoryClicked: async () => {
        // close menu
        patchState(store, { isOpenMenu: false });

        // show alert
        const alert = await alertCtrl.create({
          header: `"${
            store.todosViewModel.category()?.title
          }"のリストを削除しますか？`,
          message:
            'この操作によりこのリストにあるリマインダーがすべて削除されます。',
          buttons: [
            { text: 'キャンセル', role: 'cancel' },
            {
              text: '削除',
              role: 'destructive',
              handler: () => {
                location.back();
                const category = store.todosViewModel().category;
                if (category) categoryFacade.deleteCategory(category.id);
              },
            },
          ],
        });
        await alert.present();
      },
    })
  )
);
