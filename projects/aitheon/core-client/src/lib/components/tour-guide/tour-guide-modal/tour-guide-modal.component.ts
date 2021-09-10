import { Component, OnInit, Output, EventEmitter, TemplateRef, ViewChild, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TourGuideService } from '../../../services/tour-guide.service';
import { TourGuideStep, TourGuidPositions, TourGuideActions } from '../../../services/tour-guide-step';
import { HelpCenterService } from '../../../services/help-center.service';
import { Router, NavigationEnd } from '@angular/router';


@Component({
  selector: 'ai-tour-guide-modal',
  templateUrl: './tour-guide-modal.component.html',
  styleUrls: ['./tour-guide-modal.component.scss']
})
export class TourGuideModalComponent implements OnInit {

  @Input() modalClass = '';
  @Output() success: EventEmitter<any> = new EventEmitter<any>();
  @Output() afterRequest: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('tourGuideModal') tourGuideModal: TemplateRef<any>;

  tourGuideRef: BsModalRef;
  tourGuideForm: FormGroup;
  error: any;
  submitted = false;
  tempData: any;
  reference: string;
  path: string;
  allTours: TourGuideStep[];
  selectedTour: TourGuideStep;
  TourGuideActions = TourGuideActions;
  tourGuideActions = Object.keys(TourGuideActions);
  parents: TourGuideStep[] = [];

  tourPositions = TourGuidPositions;
  platformRole: string;
  avalableSteps: number[] = [];
  videos: any[] = [];

  constructor(
    private authService: AuthService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private tourGuideService: TourGuideService,
    private router: Router,
    private helpCenterService: HelpCenterService
  ) { }

  ngOnInit() {

    this.authService.currentUser.subscribe(user => {
      this.platformRole = user.platformRole;
    });
    this.getHelpVideos();
  }

  getHelpVideos() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects.substr(1, event.urlAfterRedirects.length);
        this.helpCenterService.listHelpVideos(url).subscribe((videos: any[]) => {
          this.videos = videos;
        });
      }
    });
  }

  public show(allTours: TourGuideStep[], selectedTour: TourGuideStep, path?: string) {
    this.allTours = allTours;
    this.selectedTour = selectedTour;
    this.path = path;
    this.buildForm();
    this._generateAvailableSteps();
    this.reference = selectedTour.reference;
    this.tourGuideRef = this.modalService.show(this.tourGuideModal, { class: this.modalClass || '' });

  }

  buildForm() {
    this.tourGuideForm = this.fb.group({
      title: [this.selectedTour.title, [Validators.required]],
      step: [this.selectedTour.step, [Validators.required]],
      action: [this.selectedTour.action || ''],
      parent: [this.selectedTour.parent || ''],
      description: [this.selectedTour.description, [Validators.required]],
      stepPosition: [this.selectedTour.stepPosition, [Validators.required]],
      _id: [this.selectedTour._id],
      video: [this.selectedTour.video || null],
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.tourGuideForm.invalid) {
      return;
    }
    const tourFormValue = this.tourGuideForm.value;
    const stepData = {
      title: tourFormValue.title,
      step: tourFormValue.step,
      description: tourFormValue.description,
      stepPosition: tourFormValue.stepPosition
    } as TourGuideStep;
    if (tourFormValue._id) {
      stepData._id = tourFormValue._id;
    }
    if (tourFormValue.action) {
      stepData.action = tourFormValue.action;
    }
    if (tourFormValue.parent) {
      stepData.parent = tourFormValue.parent;
    }
    if (tourFormValue.video) {
      stepData.video = tourFormValue.video;
    }
    const step = Object.assign({} as TourGuideStep, stepData, {path: this.path, reference: this.reference});

    if (step._id) {
      if (!step.action) {
        step.action = null;
      }
      if (!step.parent) {
        step.parent = null;
      }
      this.tourGuideService.update(step).subscribe((step: TourGuideStep) => {
        this.tourGuideRef.hide();
      });
    } else {
      this.tourGuideService.create(step).subscribe((step: TourGuideStep) => {
        this.tourGuideRef.hide();
      });
    }


    this.submitted = false;
  }

  private _generateAvailableSteps() {
    const totalSteps = this.allTours.length;
    const presentSteps = this.allTours.filter(t =>  t.step).map(s => s.step);
    this.parents = this.allTours.filter(step => step.action);

    this.avalableSteps = [];

    if (totalSteps === presentSteps.length || this.selectedTour.step) {
      // Allsteps taken
     return this.avalableSteps.push(this.selectedTour.step);
    }
    // Find avaliable steps
    for (let i = 0; i < totalSteps; i ++)  {
      if (!presentSteps.includes(i + 1)) {
        this.avalableSteps.push(i + 1);
      }
    }
  }

  deleteTour() {
    this.tourGuideService.delete(this.selectedTour).subscribe(() => {
      this.tourGuideRef.hide();
    });
  }



}
