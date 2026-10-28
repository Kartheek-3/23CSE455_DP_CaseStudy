import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../../domain/repositories/IBaseRepository";
import { ConflictError } from "../../domain/errors/ConflictError";

export abstract class BaseRepository<T, U extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<U>) {}

  async create(data: Partial<T>): Promise<T> {
    try {
      const createdItem = new this.model(data);
      const result = await createdItem.save();
      return result.toObject<T>();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError("Resource with this data already exists");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean() as Promise<T | null>;
  }

  async findOne(filter: FilterQuery<U>): Promise<T | null> {
    return this.model.findOne(filter).lean() as Promise<T | null>;
  }

  async findAll(filter: FilterQuery<U> = {}): Promise<T[]> {
    return this.model.find(filter).lean() as Promise<T[]>;
  }

  async update(id: string, updates: UpdateQuery<U>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean() as Promise<T | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return result !== null;
  }
}
