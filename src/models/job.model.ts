import { model, Schema } from 'mongoose'
import { IStatics } from './base.model'

export interface IJob {
  JobId: string
  JobTitle: string
  MinSalary: number
  MaxSalary: number
}

const jobSchema = new Schema<IJob, IStatics<IJob>>(
  {
    JobId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    JobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    MinSalary: {
      type: Number,
    },
    MaxSalary: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
)

jobSchema.methods.toJSON = function () {
  const job = this
  const jobObject = job.toObject()

  delete jobObject._id
  delete jobObject.__v

  return jobObject
}

export const Job = model<IJob, IStatics<IJob>>('job', jobSchema)
