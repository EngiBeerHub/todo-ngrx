import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircle,
  ellipsisHorizontalCircleOutline,
  trashOutline,
} from 'ionicons/icons';
import { TodoFacade } from './data-access/todo/facades/todo.facade';
import { CategoryFacade } from './data-access/category/facades/category.facade';

@Component({
  imports: [RouterModule, IonRouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly todoFacade = inject(TodoFacade);
  private readonly categoryFacade = inject(CategoryFacade);

  constructor() {
    addIcons({
      addCircle,
      ellipsisHorizontalCircleOutline,
      trashOutline,
    });
  }

  ngOnInit() {
    this.todoFacade.fetchTodos();
    this.categoryFacade.fetchCategories();
  }
}
