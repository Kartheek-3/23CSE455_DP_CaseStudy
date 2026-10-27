export interface OccupancyEvent {
  slotId: number;
  status: string;
  at: Date;
}

export interface OccupancyObserver {
  readonly name: string;
  update(event: OccupancyEvent): void;
}
