import { CanDeactivateFn } from '@angular/router';
import { JobItemPageComponent } from './job-item-page.component';

/**
 * Sprint 5 §5 — blocks navigation away from the item details routes
 * while there are unsaved changes (in-app navigation). Full page unload is
 * covered by the component's beforeunload handler. Applies to both
 * /items/new and /items/:itemId.
 */
export const itemUnsavedChangesGuard: CanDeactivateFn<JobItemPageComponent> = (
  component
) => component.canDeactivate();
