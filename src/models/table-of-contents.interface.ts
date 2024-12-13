export interface TableOfContentsConfig {
  sections: Array<TableOfContentsSection>;
}

export interface TableOfContentsSection {
  title: string;
  pageNumber: number;
}
