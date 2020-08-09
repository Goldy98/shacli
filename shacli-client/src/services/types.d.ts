export interface Content {
  contentId: string;
  contentType: "Image" | "Url" | "Text" | "Others";
  contentUrl?: string;
  contentText?: string;
}
