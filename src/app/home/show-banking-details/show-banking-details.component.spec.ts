import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowBankingDetailsComponent } from './show-banking-details.component';

describe('ShowBankingDetailsComponent', () => {
  let component: ShowBankingDetailsComponent;
  let fixture: ComponentFixture<ShowBankingDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowBankingDetailsComponent]
    });
    fixture = TestBed.createComponent(ShowBankingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
