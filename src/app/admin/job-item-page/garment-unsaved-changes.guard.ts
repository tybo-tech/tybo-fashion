import { CanDeactivateFn } from '@angular/router';
import { JobItemPageComponent } from './job-item-page.component';

/**
 * Sprint 5 §5 — blocks navigation away from the garment details routes
 * while there are unsaved changes (in-app navigation). Full page unload is
 * covered by the component's beforeunload handler. Applies to both
 * /garments/new and /garments/:garmentId.
 */
export const garmentUnsavedChangesGuard: CanDeactivateFn<JobItemPageComponent> = (
  component
) => component.canDeactivate();
