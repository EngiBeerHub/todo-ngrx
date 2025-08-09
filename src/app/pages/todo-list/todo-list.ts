import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLoading,
  IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {TodoListStore} from './todo-list-store';
import {TodoListComponent, TodolistMenuContent} from "../../../libs/ui/components";

@Component({
  imports: [
    CommonModule,
    TodoListComponent,
    IonContent,
    IonLoading,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonFooter,
    IonButton,
    IonButtons,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonBackButton,
    IonPopover,
    TodolistMenuContent,
  ],
  providers: [TodoListStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading -->
    <ion-loading [isOpen]="store.$showLoading()"></ion-loading>

    <!-- Header -->
    <ion-header [translucent]="true">
      <ion-toolbar>
        <!-- Back button -->
        <ion-buttons slot="start">
          <ion-back-button text="リスト"></ion-back-button>
        </ion-buttons>

        <!-- Title -->
        <ion-title>{{ store.todosViewModel.category()?.title }}</ion-title>

        <!-- Menu -->
        <ion-buttons slot="end">
          <ion-button id="menu" (click)="store.onIsOpenMenuToggled(true)">
            <ion-icon name="ellipsis-horizontal-circle-outline"></ion-icon>
          </ion-button>

          @if (store.isDrafting() || store.isUpdating()) {
          <ion-button (click)="store.onCompleteClicked()">完了</ion-button>
          }
        </ion-buttons>

        <ion-popover
          trigger="menu"
          [isOpen]="store.isOpenMenu()"
          [arrow]="false"
          (didDismiss)="store.onIsOpenMenuToggled(false)"
        >
          <ng-template>
            <!-- Menu content -->
            <lib-todo-list-menu-content
              [$showDoneTodos]="store.todosViewModel.showDoneTodos()"
              (hideDoneTodosClicked)="store.onShowDoneTodosToggled(false)"
              (showDoneTodosClicked)="store.onShowDoneTodosToggled(true)"
              (deleteCategoryClicked)="store.onDeleteCategoryClicked()"
            >
            </lib-todo-list-menu-content>
          </ng-template>
        </ion-popover>
      </ion-toolbar>
    </ion-header>

    <!-- Content -->
    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{
            store.todosViewModel.category()?.title
          }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Refresher -->
      <ion-refresher slot="fixed" (ionRefresh)="store.onRefreshed($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- TodoList -->
      <lib-todo-list
        [$todos]="store.todosViewModel.todos()"
        [$isDrafting]="store.isDrafting()"
        [$isUpdating]="store.isUpdating()"
        (isDraftingToggled)="store.onIsDraftingToggled($event)"
        (isUpdatingToggled)="store.onIsUpdatingToggled($event)"
        (todoAdded)="store.onTodoAdded($event)"
        (todoUpdated)="store.onTodoUpdated($event)"
        (todoDeleted)="store.onTodoDeleted($event)"
      ></lib-todo-list>
    </ion-content>

    <!-- Footer -->
    <ion-footer [translucent]="true" collapse="fade">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="store.onIsDraftingToggled(true)">
            <ion-icon name="add-circle" style="margin-right: 8px"></ion-icon>
            新規
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: ``,
})
export class TodoListPage {
  // dependencies
  readonly store = inject(TodoListStore);
}
