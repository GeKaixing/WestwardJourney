export abstract class BaseService {
  protected validateId(id: string): boolean {
    return id.length > 0;
  }

  protected ensureDefined<T>(value: T | null | undefined, name: string): T {
    if (value == null) {
      throw new Error(`${name} not found`);
    }
    return value;
  }
}
