/**
 * Generic Repository Interface
 * Provides a consistent interface for all repository implementations
 */
export interface GenericRepositoryInterface<T, CreateDto, UpdateDto> {
  /**
   * Create a new entity
   */
  create(data: CreateDto): Promise<T>;

  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities with optional filtering
   */
  findAll(filter?: any): Promise<T[]>;

  /**
   * Update entity by ID
   */
  update(id: string, data: UpdateDto): Promise<T>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find entity by specific criteria
   */
  findOne(criteria: any): Promise<T | null>;

  /**
   * Find multiple entities by specific criteria
   */
  findMany(criteria: any): Promise<T[]>;

  /**
   * Count entities matching criteria
   */
  count(criteria?: any): Promise<number>;

  /**
   * Check if entity exists
   */
  exists(criteria: any): Promise<boolean>;
}
