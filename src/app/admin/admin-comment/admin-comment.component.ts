import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IComment, initComment } from 'src/models/comment.model';

@Component({
  selector: 'app-admin-comment',
  templateUrl: './admin-comment.component.html',
  styleUrls: ['./admin-comment.component.scss'],
})
export class AdminCommentComponent {
  @Input() title: string = '';
  @Input() comments: IComment[] = [];
  @Output() onEdit = new EventEmitter<IComment[]>();
  editingComment?: IComment;
  comment = '';
  attachment = '';
  show_attachment = false;

  selectedComment: IComment | null = null;
  newComment?: IComment;

  openMenu(comment: IComment) {
    this.selectedComment = comment;
  }

  closeMenu() {
    this.selectedComment = null;
  }

  editComment(comment: IComment) {
    this.onEdit.emit(this.comments);
    this.closeMenu();
  }

  deleteComment(comment: IComment) {
    this.comments = [];
    this.onEdit.emit(this.comments);
    this.closeMenu();
  }
  saveEditComment(comment: IComment) {
    this.onEdit.emit(this.comments);
    this.editingComment = undefined;
  }
  addComment() {
    this.newComment = initComment();
    this.newComment.comment = this.comment;
    this.newComment.attachment = this.attachment;
    this.comments.push(this.newComment);
    this.clear_comment();
    this.onEdit.emit(this.comments);
  }
  clear_comment() {
    this.comment = '';
    this.attachment = '';
    this.show_attachment = false;
  }
  image_changed(url: string) {
    this.attachment = url;
    this.show_attachment = false;
  }
}
