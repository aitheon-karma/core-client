import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from '../../services/helper.service';
import { RestService } from '../../services/rest.service';

@Component({
  selector: 'ai-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: FileUploadComponent,
    multi: true
  }]
})
export class FileUploadComponent implements OnInit, ControlValueAccessor {
  @ViewChild('driveUploader') driveUploader: any;
  @Input() userId: string;
  @Input() serviceKey: {
    _id: string,
    key: string
  };
  @Input() organizationId: string;
  @Input() queeFile: any;

  private onChange;
  loading = false;
  docs: any[] = [];
  items: any[] = [];
  allowedMimeType = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/x-iwork-pages-sffpages', // .pages
    'video/*'
  ];

  videoTypes = ['video/mp4', 'video/quicktime', 'video/x-flv', 'video/3gpp', 'video/x-msvideo', 'video/x-ms-wmv'];
  imageTypes = ['image/png', 'image/jpeg'];

  constructor(
    private toastr: ToastrService,
    private restService: RestService,
    private helperService: HelperService,
  ) { }

  ngOnInit() { }

  ngOnChanges() {
    if (this.queeFile) {
      this.addFileToQuee(this.queeFile);
      this.helperService.sendAcl(this.userId, this.serviceKey).subscribe((res) => {
        this.loading = false;
        this.driveUploader.uploadAll();
      }, (err: any) => {
        this.loading = false;
        this.toastr.error('Could not upload files');
        this.driveUploader.uploader.queue = [];
      });
    }
  }

  addFileToQuee(file: any) {
    this.driveUploader.uploader.addToQueue([file]);
  }

  onBeforeUpload(event) {
    this.loading = true;

    this.helperService.sendAcl(this.userId, this.serviceKey).subscribe((res) => {
      this.loading = false;
      this.driveUploader.uploadAll();
    }, (err: any) => {
      this.loading = false;
      this.toastr.error('Could not upload files');
      this.driveUploader.uploader.queue = [];
    });
  }

  onSuccessUpload(file: any) {
    this.items.push(file);
    this.docs.push({
      _id: file._id,
      filename: file.name,
      mimetype: file.contentType,
      url: file.signedUrl
    });
    this.onChange(this.docs);
  }

  removeDocument(doc) {
    const index = this.docs.findIndex((item: Document) => item === doc);
    this.docs.splice(index , 1);
    this.items.splice(index , 1);
  }

  writeValue(value) {
    if (Array.isArray(value)) {
      this.docs = value;
    } else {
      this.docs = !!value ? [value] : [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {  }

  setDisabledState(isDisabled: boolean): void {  }

  openFile(url: any) {
    window.open(url, '_blank');
  }
}
