import { CanDeactivateFn } from '@angular/router';
import { JobEditorComponent } from './job-editor.component';

/**
 * Sprint 5 §3 — blocks navigation away from /jobs/:jobId/edit while there
 * are unsaved changes (in-app navigation). Full page unload is covered by
 * the component's beforeunload handler.
 */
export const unsavedChangesGuard: CanDeactivateFn<JobEditorComponent> = (
  component
) => component.canDeactivate();
