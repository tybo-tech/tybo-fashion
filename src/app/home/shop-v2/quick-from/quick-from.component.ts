import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IForm } from 'src/models/IForm';
import { AddModalService } from 'src/services/add.modal.service';

@Component({
  imports: [CommonModule, FormsModule],
  standalone: true,
  selector: 'app-quick-from',
  templateUrl: './quick-from.component.html',
  styleUrls: ['./quick-from.component.scss'],
  providers: [AddModalService],
})
export class QuickFromComponent {
  @Input({ required: true }) form!: IForm;
  @Input() show_x = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<IForm>();

  is_password_visible = false;

  submit() {
    this.onSubmit.emit(this.form);
  }

  imageChanged(index: number, url: string) {
    this.form.items[index].value = url;
  }
}
