import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemFile, ReportBug } from '../../services/report-bug';
import { DriveUploaderComponent } from '../drive-uploader/drive-uploader.component';
import { HelperService } from '../../services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { FeatureRequest } from '../../services/feature-request';
import html2canvas from 'html2canvas';
import { ImageDrawingComponent } from '../image-drawing/image-drawing.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'ai-feature-request-form',
  templateUrl: './feature-request-form.component.html',
  styleUrls: ['./feature-request-form.component.scss']
})
export class FeatureRequestFormComponent implements OnInit {
  @Output() isRequestMode = new EventEmitter<boolean>();
  isRequest: boolean;

  submitted = false;
  loading = false;
  featureRequestForm: FormGroup;
  @ViewChild('driveUploader') driveUploader: DriveUploaderComponent;
  @ViewChild('imageDrawing') imageDrawing: ImageDrawingComponent;
  itemImageFile: ItemFile = new ItemFile();
  itemImageFiles: ItemFile[] = [];
  itemImages: any = [];
  imageLoading = false;
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

  services: any[];
  userId: string;

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.serviceKey = {
      _id: 'PLATFORM-SUPPORT',
      key: 'FEATURE_REQUEST'
    };
    this.helperService.listServices().subscribe((services: any[]) => {
      this.services = services;
    });
    this.authService.currentUser.subscribe((user: any) => {
      this.userId = user._id;
    });
  }

  buildForm() {
    this.featureRequestForm = this.fb.group({
      service: [null, [Validators.required]],
      text: ['', [Validators.required]],
      title: ['', [Validators.required]],
      images: [[]],
    });
  }

  helperMode() {
    this.isRequestMode.emit(false);
  }

  onSubmit() {
    this.submitted = true;
    if (this.featureRequestForm.invalid) {
      return;
    }
    const serviceId = this.featureRequestForm.value['service']._id;
    const featureRequest = Object.assign({ url: window.location.pathname }, this.featureRequestForm.value, { service: serviceId});
    this.helperService.createFeatureRequest(featureRequest).subscribe((featureRequest: FeatureRequest) => {
      this.submitted = false;
      this.toastr.success('Thanks for your idea. We’ll add it to our next releases');
      this.helperMode();
    });
  }

  async downloadImage() {

    this.loadingScreenshot = true;
    this.isScreenshotAdded = true;

    const canvas = await html2canvas(document.body, {scale: 0.6});

    const base64image = canvas.toDataURL('image/png');
    this.screenshotImg = base64image;
    this.loadingScreenshot = false;

    console.log(canvas, 'w;ekr;wlekr;lwekr');
    document.querySelector("html").classList.add('highest-modal');
    this.showImageDraw();
  }

  showImageDraw() {
    this.imageDrawing.show();
  }

  blobToFile = (blob: Blob, fileName: string): File => {
    const b: any = blob;
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return <File>blob;
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
