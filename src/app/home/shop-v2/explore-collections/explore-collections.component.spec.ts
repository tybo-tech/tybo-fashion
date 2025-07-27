import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreCollectionsComponent } from './explore-collections.component';

describe('ExploreCollectionsComponent', () => {
  let component: ExploreCollectionsComponent;
  let fixture: ComponentFixture<ExploreCollectionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExploreCollectionsComponent]
    });
    fixture = TestBed.createComponent(ExploreCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
