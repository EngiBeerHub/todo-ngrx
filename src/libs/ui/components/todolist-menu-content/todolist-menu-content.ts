import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
import { eyeOffOutline, eyeOutline, trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'lib-todo-list-menu-content',
  imports: [CommonModule, IonContent, IonIcon, IonItem, IonLabel, IonList],
  template: `
    <ion-content>
      <ion-list lines="full">
        @if ($showDoneTodos()) {
        <ion-item
          button="true"
          detail="false"
          (click)="hideDoneTodosClicked.emit()"
        >
          <ion-label>実行済みを非表示</ion-label>
          <ion-icon name="eye-off-outline" slot="end"></ion-icon>
        </ion-item>
        } @else {
        <ion-item
          button="true"
          detail="false"
          (click)="showDoneTodosClicked.emit()"
        >
          <ion-label>実行済みを表示</ion-label>
          <ion-icon name="eye-outline" slot="end"></ion-icon>
        </ion-item>
        }

        <ion-item
          button="true"
          detail="false"
          lines="none"
          (click)="deleteCategoryClicked.emit()"
        >
          <ion-label color="danger">リストを削除</ion-label>
          <ion-icon name="trash-outline" slot="end" color="danger"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: ``,
})
export class TodolistMenuContent {
  // inputs
  $showDoneTodos = input.required<boolean>();

  // outputs
  closePopover = output();
  hideDoneTodosClicked = output();
  showDoneTodosClicked = output();
  deleteCategoryClicked = output();

  constructor() {
    addIcons({
      trashOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }
}
