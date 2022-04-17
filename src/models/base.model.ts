import { Model } from 'mongoose'

export interface IBase<T> {
  save(): Promise<T>
}

export interface IStatics<T> extends Model<T> {
  getUpdatableAttributes: () => string[]
  getSearchableAttributes: () => {
    attr: string
    type: 'Number' | 'String'
  }[]
}
