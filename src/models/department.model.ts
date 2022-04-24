import { Schema, model } from 'mongoose';

import { IBase, IStatics } from '.';

export interface IDepartment extends IBase<IDepartment> {
  DepartmentId: number;
  DepartmentName: string;
  ManagerId: number;
  LocationId: number;
  [key: string]: unknown;
}

const departmentSchema = new Schema<IDepartment, IStatics<IDepartment>>(
  {
    DepartmentId: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
    },
    DepartmentName: {
      type: String,
      required: true,
      trim: true,
    },
    ManagerId: {
      type: Number,
      trim: true,
    },
    LocationId: {
      type: Number,
      trim: true,
      ref: 'location',
    },
  },
  {
    timestamps: true,
  },
);

departmentSchema.virtual('employees', {
  ref: 'employee',
  localField: 'DepartmentId',
  foreignField: 'DepartmentId',
});

departmentSchema.methods.toJSON = function () {
  const department = this;
  const departmentObject = department.toObject();

  delete departmentObject._id;
  delete departmentObject.__v;

  return departmentObject;
};

departmentSchema.statics.getUpdatableAttributes = function () {
  return ['DepartmentId', 'DepartmentName', 'ManagerId', 'LocationId'];
};

departmentSchema.statics.getSearchableAttributes = function () {
  return [
    { attr: 'DepartmentId', type: 'Number' },
    { attr: 'DepartmentName', type: 'String' },
    { attr: 'ManagerId', type: 'Number' },
    { attr: 'LocationId', type: 'Number' },
  ];
};

/* departmentSchema.pre('remove', async function(next) {
    const department = this;
    await Employee.deleteMany({ DepartmentId: department.DepartmentId });
    next();
}); */

export const Department = model<IDepartment, IStatics<IDepartment>>(
  'department',
  departmentSchema,
);
