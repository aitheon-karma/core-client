import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable()
export class DriveUploaderService {

    dropZoneVisible: boolean;

    constructor(
    ) { }


    showDropZone() {
        this.dropZoneVisible = true;
    }

    hideDropZone() {
        this.dropZoneVisible = false;
    }

}
