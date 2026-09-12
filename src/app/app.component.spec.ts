import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [AppComponent],
      providers: [
        // AppComponent pulls in UpdateService, whose constructor subscribes to
        // SwUpdate.versionUpdates. Provide a stub so the shell can be created
        // without the service-worker runtime.
        {
          provide: SwUpdate,
          useValue: {
            versionUpdates: of(),
            available: of(),
            unrecoverable: of(),
            checkForUpdate: () => Promise.resolve(false),
            activateUpdate: () => Promise.resolve(true),
          },
        },
      ],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
