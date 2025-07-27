import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-product-note',
  templateUrl: './custom-product-note.component.html',
  styleUrls: ['./custom-product-note.component.scss']
})
export class CustomProductNoteComponent {
@Input() notes = `
This product is a custom design
  serving as inspiration, the material or design may differ due to availability
  or personal preference
`
}
