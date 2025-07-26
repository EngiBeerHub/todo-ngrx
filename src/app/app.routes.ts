import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/category-list',
  },
  {
    path: 'category-list',
    loadComponent: () =>
      import('./pages/category-list/category-list').then(
        (m) => m.CategoryListPage
      ),
  },
  {
    path: 'category/:categoryId/todos',
    loadComponent: () =>
      import('./pages/todo-list/todo-list').then((m) => m.TodoListPage),
  },
  {
    path: 'todo-list',
    loadComponent: () =>
      import('./pages/todo-list/todo-list').then((m) => m.TodoListPage),
  },
];
