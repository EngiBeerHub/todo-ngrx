import { Component, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCheckbox,
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
import { FormsModule } from '@angular/forms';
import { sleep } from '../utils/sleep';
import { CheckboxCustomEvent } from '@ionic/angular';
import {TodoModel} from "../../../data-access/todo";

@Component({
  selector: 'lib-todo-list',
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonCheckbox,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonInput,
    FormsModule,
    IonLabel,
  ],
  templateUrl: './todo-list.html',
  styles: ``,
})
export class TodoListComponent {
  // input
  $todos = input.required<TodoModel[]>();
  $isDrafting = input.required<boolean>();
  $isUpdating = input.required<boolean>();

  // output
  todoAdded = output<TodoModel>();
  todoUpdated = output<TodoModel>();
  todoDeleted = output<TodoModel>();
  isDraftingToggled = output<boolean>();
  isUpdatingToggled = output<boolean>();

  // add draft value
  $newTodoTitle = model('');
  $newTodoIsDone = model(false);

  // update draft value
  $editingTodoId = signal<number | null>(null);
  $editingTitle = model('');
  $editingTodo = signal<TodoModel | null>(null);

  constructor() {
    addIcons({ trash });
  }

  onAddConfirmed() {
    this.todoAdded.emit({
      id: null,
      categoryId: null,
      title: this.$newTodoTitle(),
      description: null,
      dueDate: null,
      isDone: this.$newTodoIsDone(),
    });
    this.resetLocalState();
  }

  onCheckedChange(todo: TodoModel, event: CheckboxCustomEvent) {
    this.todoUpdated.emit({ ...todo, isDone: event.detail.checked });
  }

  onStartEditing(todo: TodoModel) {
    this.isUpdatingToggled.emit(true);
    this.$editingTodoId.set(todo.id);
    this.$editingTitle.set(todo.title);
    this.$editingTodo.set(todo);
  }

  onEditConfirmed(todo: TodoModel) {
    if (todo.title !== this.$editingTitle()) {
      this.todoUpdated.emit({ ...todo, title: this.$editingTitle() });
    }
    this.resetLocalState();
  }

  async onTodoDeleted(todo: TodoModel, sliding: IonItemSliding) {
    await sliding.close();
    await sleep(400);
    this.todoDeleted.emit(todo);
  }

  private resetLocalState() {
    this.isDraftingToggled.emit(false);
    this.isUpdatingToggled.emit(false);
    this.$newTodoTitle.set('');
    this.$newTodoIsDone.set(false);
    this.$editingTodoId.set(null);
    this.$editingTitle.set('');
    this.$editingTodo.set(null);
  }
}
