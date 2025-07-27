import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  constructor(private updates: SwUpdate) {
    this.updates.versionUpdates
      .pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY')
      )
      .subscribe((event) => {
        this.promptUser();
      });
  }

  promptUser(): void {
    if (confirm('New version available. Load new version?')) {
      this.updates.activateUpdate().then(() => document.location.reload());
    }
  }
}
