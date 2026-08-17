export interface AdapterResult<T> {
  data: T;
  retrievedAt: string;
  sourceUrl: string;
}

export interface SourceAdapter<T> {
  readonly id: string;
  readonly sourceUrl: string;
  fetch(): Promise<AdapterResult<T>>;
}
