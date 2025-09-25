export class AvailabilityResponseDto {
  id: string;
  painterId: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(availability: any) {
    this.id = availability.id;
    this.painterId = availability.painterId;
    this.startTime = availability.startTime.toISOString();
    this.endTime = availability.endTime.toISOString();
    this.createdAt = availability.createdAt;
    this.updatedAt = availability.updatedAt;
  }
}
