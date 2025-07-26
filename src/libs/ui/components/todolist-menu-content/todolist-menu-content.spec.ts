import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodolistMenuContent } from './todolist-menu-content';

describe('TodoListMenuContentComponent', () => {
  let component: TodolistMenuContent;
  let fixture: ComponentFixture<TodolistMenuContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodolistMenuContent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodolistMenuContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
