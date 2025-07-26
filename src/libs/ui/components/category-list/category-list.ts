import { Component, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { sleep } from '../utils/sleep';
import { FormsModule } from '@angular/forms';
import {CategoryModel} from "../../../data-access/todo";

@Component({
  selector: 'lib-category-list',
  imports: [
    CommonModule,
    IonList,
    IonItemSliding,
    IonItem,
    IonLabel,
    IonItemOptions,
    IonIcon,
    IonItemOption,
    IonInput,
    FormsModule,
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryListComponent {
  // input
  $categories = input.required<CategoryModel[]>();
  $isDrafting = input.required<boolean>();

  // output
  isDraftingToggled = output<boolean>();
  categorySelected = output<number>();
  categoryAdded = output<CategoryModel>();
  categoryUpdated = output<CategoryModel>();
  categoryDeleted = output<CategoryModel>();

  // add draft value
  $newCategoryTitle = model('');

  constructor() {
    addIcons({ trash });
  }

  onCategorySelected(categoryId: number | null) {
    if (categoryId) this.categorySelected.emit(categoryId);
  }

  onAddConfirmed() {
    this.categoryAdded.emit({
      id: null,
      title: this.$newCategoryTitle(),
      description: null,
      showDoneTodos: false,
    });
    this.resetLocalState();
  }

  async onCategoryDeleted(category: CategoryModel, sliding: IonItemSliding) {
    await sliding.close();
    await sleep(400);
    this.categoryDeleted.emit(category);
  }

  private resetLocalState() {
    // this.$isDrafting.set(false);
    this.isDraftingToggled.emit(false);
    this.$newCategoryTitle.set('');
  }
}
