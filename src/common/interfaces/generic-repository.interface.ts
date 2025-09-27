export interface GenericRepositoryInterface<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;

  findById(id: string): Promise<T | null>;

  findAll(filter?: any): Promise<T[]>;

  update(id: string, data: UpdateDto): Promise<T>;

  delete(id: string): Promise<void>;

  findOne(criteria: any): Promise<T | null>;

  findMany(criteria: any): Promise<T[]>;

  count(criteria?: any): Promise<number>;

  exists(criteria: any): Promise<boolean>;
}
