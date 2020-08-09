export interface Content {
  contentId: string;
  contentType: "Image" | "Url" | "Text" | "Others";
  contentUrl?: string;
  contentText?: string;
}

export interface ProcessResult {
  success: boolean;
  result?: string | boolean | any;
  message?: string;
  error?: any;
}

export interface FileData {
  mediaType: string;
  weightB: number;
  binData: Buffer;
  fileName: string;
}
