export class Document {

    _id: string;
    name: string;
    organization: any;
    service: {
        _id: string,
        key: string
    };
    createdAt: Date;
    updatedAt: Date;
    size: number;
    contentType: string;

    uploading: boolean;
    uploadingProgress: number;

    previewLink: string;
}
