import { Component, OnInit, Output, EventEmitter, Input, ViewChild, HostBinding } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TourGuideService } from '../../services/tour-guide.service';
import { HelpCenterService } from '../../services/help-center.service';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ElementRef } from '@angular/core';
import { AiWebClientService } from '@aitheon/ai-web-client-angular';
import { getWebClientConfig } from '../../utils/get-web-client-config';

@Component({
  selector: 'ai-helper',
  templateUrl: './helper.component.html',
  styleUrls: ['./helper.component.scss']
})
export class HelperComponent implements OnInit {

  path: string;

  @Input() errorLogs: any;
  @Input()
  @HostBinding('class.opened')
  opened = false;

  @HostBinding('class.hidden')
  hidden = false;

  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  searchFocused: boolean;
  searchValue;
  searchFocus = false;

  isReportMode = false;
  isRequestMode = false;

  controls = false;
  routeName: string;

  @ViewChild('videoPlayer') videoPlayer: ElementRef;

  helpCenterContent: { faqs: any[], helpVideos: any[], userGuides: any[], allFaqs: any[], route: any[] };
  currentFaq: any;

  private get isLocalhost() {
    return window.location.hostname === 'localhost';
  }

  constructor(
    private router: Router,
    private tourGuideService: TourGuideService,
    private helpCenterService: HelpCenterService,
    private aiWebClientService: AiWebClientService
  ) { }

  requests$: Observable<{ faqs: any[]; helpVideos: any[]; userGuides: any[]; allFaqs: any[], route: any[] }>;


  ngOnInit() {
    this.path = this.getPath();
    this.watchRouteChanges();

    const webClientConfig = getWebClientConfig();
    this.aiWebClientService.initialize(webClientConfig);
  }

  watchRouteChanges() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects.substr(1, event.urlAfterRedirects.length);
        this.requests$ = forkJoin([this.helpCenterService.listFAQ(url),
          this.helpCenterService.listHelpVideos(url),
          this.helpCenterService.listUserGuide(url),
          this.helpCenterService.getHelpRoute(url)
        ])
          .pipe((map(responses => ({
            faqs: responses[0],
            helpVideos: responses[1],
            userGuides: responses[2],
            allFaqs: responses[0],
            route: responses[3]
          }))));
        this.requests$.subscribe(results => {
          this.helpCenterContent = results;
          if (this.helpCenterContent.route && this.helpCenterContent.route.length) {
            this.routeName = this.helpCenterContent.route[0].name;
          } else {
            this.routeName = undefined;
          }
        });
      }
    });
  }

  close(): void {
    this.opened = false;
    this.isReportMode = false;
    this.isRequestMode = false;
    this.currentFaq = undefined;
    this.searchValue = '';
    this.openedChange.emit(false);
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      this.videoPlayer.nativeElement.pause();
    }
  }

  getPath() {
    const url = this.isLocalhost ? '/localhost' + this.router.url : '/' + location.pathname.split('/')[1] + this.router.url;
    return url;
  }

  fun(event: Event, search) {
    event.preventDefault();
    event.stopPropagation();
    this.searchValue = '';
    search.focus();
  }

  onBlur() {
    setTimeout(() => {
      this.searchFocused = false;
    }, 100);
  }

  isFocus() {
    this.searchFocus = !this.searchFocus;
  }

  reportMode() {
    this.isReportMode = !this.isReportMode;
    this.currentFaq = undefined;
  }

  guideMe() {
    this.tourGuideService._startTour.next(true);
    this.close();
  }

  requestMode() {
    this.isRequestMode = !this.isRequestMode;
    this.currentFaq = undefined;
  }

  videoClicked() {
    this.controls = true;
    this.videoPlayer.nativeElement.play();
  }

  faqDetailBack() {
    this.currentFaq = undefined;
  }

  faqSearch(searchText: string) {

    if (searchText.trim() === '' || !searchText) {
      this.helpCenterContent.faqs = [...this.helpCenterContent.allFaqs];
    }

    this.helpCenterContent.faqs = this.helpCenterContent.allFaqs.filter(af => {
      return af.question.toLowerCase().includes(searchText.toLowerCase())
        || af.answer.toLowerCase().includes(searchText.toLowerCase());
    });
  }

  getLiveHelp() {
    this.close();
    this.aiWebClientService.show();
  }

}
