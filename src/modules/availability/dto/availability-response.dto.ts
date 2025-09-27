export class CreatorInfoDto {
  id: string;
  name: string;
  role: string;

  constructor(creator: any) {
    this.id = creator.id;
    this.name = creator.name;
    this.role = creator.role;
  }
}

export class AvailabilityResponseDto {
  id: string;
  createdBy: string;
  creator?: CreatorInfoDto;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(availability: any) {
    this.id = availability.id;
    this.createdBy = availability.createdBy;
    this.creator = availability.creator ? new CreatorInfoDto(availability.creator) : undefined;
    this.startTime = availability.startTime.toISOString();
    this.endTime = availability.endTime.toISOString();
    this.createdAt = availability.createdAt;
    this.updatedAt = availability.updatedAt;
  }
}
