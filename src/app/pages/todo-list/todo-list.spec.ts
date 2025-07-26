import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoListPage } from './todo-list';

describe('TodoList', () => {
  let component: TodoListPage;
  let fixture: ComponentFixture<TodoListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
