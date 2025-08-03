import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import {CategoryListStore} from './category-list-store';
import {CategoryListComponent} from "../../../libs/ui/components";

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLoading,
    IonFooter,
    IonButtons,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    CategoryListComponent,
  ],
  providers: [CategoryListStore],
  template: `
    <!-- Loading -->
    <ion-loading [isOpen]="store.$showLoading()"></ion-loading>

    <!-- Header -->
    <ion-header [translucent]="true">
      <ion-toolbar>
        <!-- Title -->
        <ion-title id="page-title">マイリスト</ion-title>

        @if (store.isDrafting()) {
          <ion-buttons slot="end">
            <ion-button id="complete-button" (click)="store.onCompleteClicked()">完了</ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <!-- Content -->
    <ion-content color="light" [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">マイリスト</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Refresher -->
      <ion-refresher slot="fixed" (ionRefresh)="store.onRefreshed($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- CategoryList -->
      <lib-category-list
        [$categories]="store.categoriesViewModel.categories()"
        [$isDrafting]="store.isDrafting()"
        (categoryAdded)="store.onCategoryAdded($event)"
        (categorySelected)="store.onCategorySelected($event)"
        (categoryDeleted)="store.onCategoryDeleted($event)"
        (isDraftingToggled)="store.onIsDraftingToggled($event)"
      ></lib-category-list>
    </ion-content>

    <!-- Footer -->
    <ion-footer [translucent]="true" collapse="fade">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button id="new-button" (click)="store.onIsDraftingToggled(true)">
            <ion-icon name="add-circle" style="margin-right: 8px"></ion-icon>
            新規
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: ``,
})
export class CategoryListPage {
  // dependencies
  readonly store = inject(CategoryListStore);
}
