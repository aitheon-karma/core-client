export class ReportBug {
  _id: string;
  title?: string;
  text: string;
  user?: any;
  userAgent?: string;
  url?: string;
  status?: string;
  ip?: string;
  images?: Array<ItemFile>;
  createdAt?: string;
  updatedAt?: string;
}

export class ItemFile {
  _id: string;
  filename?: string;
  mimetype?: string;
  url?: string;
  createdAt?: any;
}
