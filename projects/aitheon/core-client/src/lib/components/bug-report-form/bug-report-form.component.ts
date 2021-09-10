import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemFile, ReportBug } from '../../services/report-bug';
import { DriveUploaderComponent } from '../drive-uploader/drive-uploader.component';
import { HelperService } from '../../services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { Input } from '@angular/core';
import html2canvas from 'html2canvas';
import { ImageDrawingComponent } from '../image-drawing/image-drawing.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'ai-bug-report-form',
  templateUrl: './bug-report-form.component.html',
  styleUrls: ['./bug-report-form.component.scss']
})
export class BugReportFormComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  @Output() isReportMode = new EventEmitter<boolean>();
  @Input() errorLogs: any;
  isReport: boolean;
  submitted = false;
  loading = false;
  bugReportForm: FormGroup;
  @ViewChild('driveUploader') driveUploader: DriveUploaderComponent;
  @ViewChild('imageDrawing') imageDrawing: ImageDrawingComponent;
  itemImageFile: ItemFile = new ItemFile();
  itemImageFiles: ItemFile[] = [];
  itemImages: any = [];
  imageLoading = false;
  userId: string;
  currentOrganization = {
    _id: '5ce2878a8f900e000fb595e6'
  };
  serviceKey: any;
  allowedMimeType = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/x-iwork-pages-sffpages' // .pages
  ];
  loadingScreenshot = false;
  screenshotFile: any;
  isScreenshotAdded = false;
  screenshotImg: string;

  config = {
    ignoreBackdropClick: true
  };

  ngOnInit() {
    this.buildForm();
    this.serviceKey = {
      _id: 'PLATFORM_SUPPORT',
      key: 'BUG_REPORT'
    };
    this.authService.currentUser.subscribe((user: any) => {
      this.userId = user._id;
    });
  }

  buildForm() {
    this.bugReportForm = this.fb.group({
      title: ['', [Validators.required]],
      text: ['', [Validators.required]],
      images: [[]]
    });
  }

  helperMode() {
    this.isReportMode.emit(false);
  }

  onSubmit() {
    this.submitted = true;
    const errorLogs = this.errorLogs
      .filter(error => error[0] === 'ERROR')
      .map((error: any) => {
        const result = {
          message: error[1].message || error[1],
          stack: error[1].stack
        };
        return result;
      });
    if (this.bugReportForm.invalid) {
      return;
    }
    const bug = Object.assign({ url: window.location.pathname }, this.bugReportForm.value, { errorLogs });
    this.helperService.createReportBug(bug).subscribe((bug: ReportBug) => {
      this.submitted = false;
      this.toastr.success('Thank you for helping us to make Aitheon better');
      (document.querySelector('#toast-container') as HTMLElement).style.zIndex = '2147483648';
      this.helperMode();
    });
  }

  onSuccessUpload(event: any) {
    this.itemImageFile = new ItemFile();
    this.itemImages.push(event.signedUrl);
    this.itemImageFile._id = event._id;
    this.itemImageFile.filename = event.name;
    this.itemImageFile.mimetype = event.contentType;
    this.itemImageFile.url = event.signedUrl;
    this.itemImageFiles.push(this.itemImageFile);
    this.imageLoading = true;
  }

  b64toBlob(b64Data: any, contentType: string = '', sliceSize: number = 512) {

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }


  async downloadImage() {

    this.loadingScreenshot = true;
    this.isScreenshotAdded = true;

    const canvas = await html2canvas(document.body, {scale: 0.6});

    const base64image = canvas.toDataURL('image/png');
    this.screenshotImg = base64image;
    this.loadingScreenshot = false;
    document.querySelector("html").classList.add('highest-modal');
    this.showImageDraw();
  }

  blobToFile = (blob: Blob, fileName: string): File => {
    const b: any = blob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return <File>blob;
  }

  showImageDraw() {
    this.imageDrawing.show();
  }

  onDrawingSave(imageBlob: any) {
    const secDate = new Date().getTime();
    const myFile = this.blobToFile(imageBlob, `screenshot-${secDate}.png`);
    this.screenshotFile = myFile;
    document.querySelector("html").classList.remove('highest-modal');
  }

  onDrawCancel() {
    this.isScreenshotAdded = false;
    document.querySelector("html").classList.remove('highest-modal');
  }
}

