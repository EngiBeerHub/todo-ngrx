import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TodolistMenuContent} from './todolist-menu-content';
import {ComponentRef} from "@angular/core";

describe('TodoListMenuContentComponent', () => {
  let component: TodolistMenuContent;
  let componentRef: ComponentRef<TodolistMenuContent>;
  let fixture: ComponentFixture<TodolistMenuContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodolistMenuContent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodolistMenuContent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('$showDoneTodos', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
