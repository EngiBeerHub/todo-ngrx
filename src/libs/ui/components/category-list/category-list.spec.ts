import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CategoryListComponent} from './category-list';
import {ComponentRef} from "@angular/core";

describe('CategoryList', () => {
  let component: CategoryListComponent;
  let componentRef: ComponentRef<CategoryListComponent>
  let fixture: ComponentFixture<CategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('$categories', []);
    componentRef.setInput('$isDrafting', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
