import { Directive, HostListener, HostBinding, OnInit } from '@angular/core';
import { DriveUploaderService } from './drive-uploader.service';

@Directive({ selector: '[aiDriveUploader]' })
export class DriveUploaderDirective implements OnInit {

  @HostBinding('class.ai-drive-uploader-wrapper') isDriveUploader = true;

  public constructor(
    public driveUploaderService: DriveUploaderService
  ) {
  }


  ngOnInit(): void {
  }

  @HostListener('dragover', [ '$event' ])
  public onDragOver(event: any): void {
    this.driveUploaderService.showDropZone();
  }

}
