import { Component, Input } from '@angular/core';
import { OtherInfo } from 'src/models/other-info.model';

@Component({
  selector: 'app-collection-banner',
  templateUrl: './collection-banner.component.html',
  styleUrls: ['./collection-banner.component.scss']
})
export class CollectionBannerComponent {
 @Input({required:true}) categories!: OtherInfo<any>[];
 get top4(){
    return this.categories.slice(0,4);
 }
}
