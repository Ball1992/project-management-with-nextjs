export interface ILocation {
  id: string;
  name: string;
  isActive: boolean;
  createdBy?: string;
  createdByName?: string;
  createdDate: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedDate: string;
}

export interface CreateLocationDto {
  name: string;
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {}
