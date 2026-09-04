# Sprint 5 — Job Hierarchy: Overview → Plain Garment List → Garment Details

## Problem

The current job page mixes overview, editing, item management, payments and
destructive actions in one surface. The hierarchy should be:

**Jobs → Job details → Garment details**

Findings on latest `main` (`b4638c8`):

- Only the thumbnail and garment name navigate; the complete row should
  navigate.
- Status and total are repeated in multiple places.
- The customer field opens another editable form inside the job page,
  adding another mixed responsibility.
- The garment page loads the entire job and locates the item client-side,
  although a dedicated item endpoint already exists.
- The documented PHP item endpoints still lack authenticated
  tenant/parent enforcement. That must be a hard backend check before
  treating direct garment URLs as secure.
- Routes such as `/job/:id/jobs` work, but the final hierarchy reads
  better as `/jobs/:jobId` and `/jobs/:jobId/items/:itemId`, with
  redirects from old links.

## Goal (user directive)

- **Clean parent overview** — job details is read-first.
- **Plain child list** — garments rendered as a plain list, no cards.
- **Dedicated child detail/editor** — the only editing surface.
- **Destructive action only at the deepest level.**

## Implementation

### 1. Job details becomes primarily an overview

Keep:

- Job number, status, due date and payment summary.
- Customer summary.
- Invoice and payment actions.
- Garments list.
- Totals and special instructions.

Changes:

- Move customer, due-date and broader job editing behind a clear
  **Edit job** action. The current automatic saving when status/due-date
  changes is not obvious enough.
- Status may remain a quick action (it changes frequently); everything
  else is read-first.

### 2. Garments becomes the same plain-list pattern as Jobs

Remove the rounded container around every garment, quantity stepper and
delete button.

Each row shows:

- Small thumbnail.
- Garment name.
- Size and colour.
- `Qty 1`.
- Assigned person, when available.
- Line total.
- Chevron.

Rules:

- The entire row is one clickable target.
- Only top, bottom and between-row separators — no row shadows or
  rounded cards.
- Keep **Add garment** in the section header. Shopify may lock down order
  editing more heavily, but Tybo's tailoring workflow genuinely needs
  garments to be added after job creation.

### 3. Garment details becomes the only editing surface

Clicking a garment opens:

`JOB642 → Mini length ostrich leather skirt`

This page owns:

- Image.
- Name.
- Size and measurements.
- Colour.
- Quantity.
- Unit price.
- Assigned person.
- Notes.
- Print card.
- Save.

Changes:

- Rename **Edit item** to **Garment details**, or use the garment name as
  the heading. It should feel like a real child record, not a temporary
  edit form.
- Put **Remove from job** at the bottom as a quiet danger action.
  Confirmation names the garment and explains that the job totals will be
  recalculated. Removal must not appear in the parent list.

### 4. Routes

- `/jobs/:jobId` and `/jobs/:jobId/items/:itemId`.
- Redirects from legacy links (`/job/:id/jobs` etc.).

### 5. Backend (hard gate)

- Authenticated tenant/parent enforcement on the item endpoints before
  direct garment URLs are treated as secure.

## Acceptance criteria

- [ ] Job page is read-first; editing sits behind **Edit job**.
- [ ] Garment rows are plain list rows (thumbnail, name, size/colour,
      qty, assigned person, line total, chevron) — no cards, no steppers,
      no inline delete.
- [ ] Entire garment row navigates to garment details.
- [ ] Garment details is the only editing surface; heading is
      **Garment details** or the garment name.
- [ ] **Remove from job** lives only at the bottom of garment details
      with an explicit confirmation naming the garment.
- [ ] Garment page uses the dedicated item endpoint (no full-job load
      with client-side lookup).
- [ ] Item endpoints enforce authenticated tenant/parent checks.
- [ ] New routes live at `/jobs/:jobId` and
      `/jobs/:jobId/items/:itemId` with legacy redirects.
