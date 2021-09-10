import { Component, OnInit, NgZone, EventEmitter, Input, Output, Optional, Inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { Document } from '../../services/document';
import { DriveUploaderService } from './drive-uploader.service';
import { ICoreClientOptions } from '../../core-client.options';
import { AI_CORE_CLIENT_OPTIONS } from '../../core-client.tokens';

@Component({
  selector: 'ai-drive-uploader',
  templateUrl: './drive-uploader.component.html',
  styleUrls: ['./drive-uploader.component.scss']
})
export class DriveUploaderComponent implements OnInit {

  @Input() isPublic = false;
  @Input() autoUpload = true;
  @Input() oganizationId: string;
  @Input() service: { _id: string; key: string };
  @Input() serviceFolder: string;

  @Input() uploadUrl: string;

  @Output() success: EventEmitter<Document> = new EventEmitter<Document>();
  @Output() failedUploadFile: EventEmitter<FileItem> = new EventEmitter<FileItem>();
  @Output() afterAddingFile: EventEmitter<FileItem> = new EventEmitter<FileItem>();

  closed = new EventEmitter();
  uploader: FileUploader;
  authToken: string;
  isFileOver: boolean;
  documents: Document[];
  showUploaderResults = false;
  baseUrl: string;

  public constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private zone: NgZone,
    public driveUploaderService: DriveUploaderService,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    this.authService.token.subscribe((token: string) => {
      this.authToken = token;
    });

    this.uploader = this.initUploader();

    if (this.uploadUrl) {
      this.baseUrl = this.uploadUrl;
    } else {
      if (options) {
        this.baseUrl = options.baseApi + '/drive/api/documents';
      } else {
        this.baseUrl = '/drive/api/documents';
      }
    }
  }

  ngOnInit() {
    this.uploader = this.initUploader();
  }

  fileOverBase(e: boolean) {
    this.isFileOver = e;
    if (!this.isFileOver) {
      this.driveUploaderService.hideDropZone();
    }
  }

  uploadAll() {
    // this.uploader.queue
    this.uploader.uploadAll();
  }

  initUploader(): FileUploader {

    this.uploader = new FileUploader({
      url: this.baseUrl,
      method: 'POST',
      authToken: 'JWT ' + this.authToken,
      autoUpload: this.autoUpload,
      removeAfterUpload: false
    });

    /**
     * Events
     */
    this.uploader.onSuccessItem = (fileItem: FileItem, response: any) => {
      setTimeout(() => {
        fileItem.remove();
        if (this.uploader.queue.length === 0) {
          this.showUploaderResults = false;
        }
      }, 1000);
      this.success.emit(JSON.parse(response));
      // file.fileItem = undefined;
      // file.uploadingFinished = true;
      // file = Object.assign(file, JSON.parse(response));
      // this.toastr.success('Document uploaded');
    };

    this.uploader.onBeforeUploadItem = () => {
      this.showUploaderResults = true;
    };

    this.uploader.onAfterAddingFile = (fileItem: FileItem) => {
      this.afterAddingFile.emit(fileItem);
      // this.showUploaderResults = true;
      // this.driveUploaderService.
      // const document = new Document();

      // document.name = fileItem.file.name;
      // document.size = fileItem.file.size;
      // document.contentType = fileItem.file.type;

      // document.uploading = true;
      // document.uploadingProgress = 0;

      // this.documents.push(document);
      const queryArray = [];
      if (this.isPublic) {
        queryArray.push(`isPublic=true`);
      }
      if (this.oganizationId) {
        queryArray.push(`organiation=${ this.oganizationId }`);
      }
      queryArray.push('signedUrlExpire=315569520');

      const query = queryArray.join('&');
      this.uploader.setOptions({ url: `${ this.baseUrl }?${ query }` });
    };


    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
    };

    this.uploader.onBuildItemForm = (fileItem: FileItem, form: any) => {
      form.append('name', fileItem.file.name);
      form.append('service', JSON.stringify(this.service));
      !!this.serviceFolder && form.append('serviceFolder', this.serviceFolder);
    };
    this.uploader.onErrorItem = (fileItem: FileItem, response: any, status: any) => {
      try {
        response = JSON.parse(response);
        response = response.message;
      } catch (err) { }
      // const fileIndex = this.documents.findIndex((c: Document) => c.fileItem && c.fileItem.index === fileItem.index);
      // if (fileIndex > -1) {
      //   this.documents.splice(fileIndex, 1);
      // }
      fileItem.remove();
      this.toastr.error(`${fileItem.file.name} ${response} `, `Upload error (${status}) `);
      this.failedUploadFile.emit(fileItem);
      if (this.uploader.queue.length === 0) {
        this.showUploaderResults = false;
      }
    };
    this.uploader.onProgressItem = (fileItem: FileItem, progress: any) => {
      this.onProgressItem(fileItem, progress);
    };

    return this.uploader;
  }

  onProgressItem(fileItem: FileItem, progress: any): void {
    // const document = this.documents.find((c: Document) => c.fileItem && c.fileItem.index === fileItem.index);
    // if (document) {
    //   this.zone.run(() => {
    //     document.uploadingProgress = progress;
    //     console.log('file.uploadingProgress', document.uploadingProgress);
    //   });
    // }
  }



}
