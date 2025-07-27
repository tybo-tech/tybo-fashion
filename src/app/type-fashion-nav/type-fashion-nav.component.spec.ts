import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeFashionNavComponent } from './type-fashion-nav.component';

describe('TypeFashionNavComponent', () => {
  let component: TypeFashionNavComponent;
  let fixture: ComponentFixture<TypeFashionNavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeFashionNavComponent]
    });
    fixture = TestBed.createComponent(TypeFashionNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
