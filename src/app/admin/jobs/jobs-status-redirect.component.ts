import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Sprint 5 §1 — redirects the six (plus one legacy alias) known
 * `/jobs/:status` slugs to the canonical `/jobs?status=<slug>` URL.
 * Anything that is not a known slug never reaches this component: the
 * UUID matcher and the `/jobs/**` fallback handle it.
 */
@Component({
  selector: 'app-jobs-status-redirect',
  template: '',
})
export class JobsStatusRedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('statusSlug') || '';
    this.router.navigate(['/store/admin/jobs'], {
      queryParams: { status: slug || null },
      replaceUrl: true,
    });
  }
}
