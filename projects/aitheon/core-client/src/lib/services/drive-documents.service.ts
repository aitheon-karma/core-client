import { Observable } from 'rxjs';
import { Injectable, Optional, Inject } from '@angular/core';
import { RestService } from './rest.service';

import { Document } from './document';
import { ICoreClientOptions } from '../core-client.options';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { map } from 'rxjs/operators';

@Injectable()
export class DriveDocumentsService {

  private baseUrl = '';

  constructor(
    private restService: RestService,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    if (options) {
      this.baseUrl = options.baseApi + '/drive/api';
    }
  }

  list(serviceId?: string, folderId?: string, keyId?: string): Observable<Document[]> {
    const params = { service: serviceId || '', folder: folderId || '', keyId: keyId || '' };
    return this.restService.fetch(`${ this.baseUrl }/documents`, params, true).pipe(map((docs: Document[]) => {
      return docs.map((doc: Document) => {
        // tslint:disable-next-line:max-line-length
        doc.previewLink = `${ this.baseUrl }/documents/${ doc._id }${ doc.organization ? `?organization-id=${ doc.organization }` : ''}`;
        return doc;
      });
    }));
  }

  get(documentId?: string): Observable<Document> {
    return this.restService.fetch(`${ this.baseUrl }/documents/${ documentId }`, undefined, true);
  }

  update(document: Document): Observable<Document> {
    return this.restService.put(`${ this.baseUrl }/documents/${ document._id }`, document, true);
  }

  remove(documentId: string): Observable<Document> {
    return this.restService.delete(`${ this.baseUrl }/documents/${ documentId }`, true);
  }

}
