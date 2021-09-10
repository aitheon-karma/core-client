export class TourGuideStep {
  _id: string;
  title: string;
  path: string;
  reference: string;
  step: number;
  description: string;
  action: String;
  parent?: any;
  video?: any;
  stepPosition: TourGuidPositions;
  createdAt: Date;
}


export enum TourGuidPositions {
  BOTTOM = 'BOTTOM',
  TOP = 'TOP',
  RIGHT = 'RIGHT',
  LEFT =  'LEFT'
}

export enum TourGuideActions {
  CLICK = 'CLICK'
}
