import { Schema, model } from 'mongoose';
import validator from 'validator';

import { IBase, IStatics } from '.';

export interface IEmployee extends IBase<IEmployee> {
  EmployeeId: number;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  HireDate: Date;
  JobId: string;
  Salary: number;
  CommissionPct: number;
  ManagerId: number;
  DepartmentId: number;
  EmployeeRating: number;
  [key: string]: unknown;
}

const employeeSchema = new Schema<IEmployee, IStatics<IEmployee>>(
  {
    EmployeeId: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
    },
    FirstName: {
      type: String,
      trim: true,
    },
    LastName: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is not correctly formatted');
        }
      },
    },
    PhoneNumber: {
      type: String,
      trim: true,
    },
    HireDate: {
      type: Date,
      required: true,
    },
    JobId: {
      type: String,
      required: true,
      trim: true,
    },
    Salary: {
      type: Number,
      trim: true,
    },
    CommissionPct: {
      type: Number,
      trim: true,
    },
    ManagerId: {
      type: Number,
      trim: true,
    },
    DepartmentId: {
      type: Number,
      trim: true,
    },
    EmployeeRating: {
      type: Number,
      trim: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

employeeSchema.virtual('directs', {
  ref: 'employee',
  localField: 'EmployeeId',
  foreignField: 'ManagerId',
});

employeeSchema.methods.toJSON = function () {
  const employee = this;
  const employeeObject = employee.toObject();

  delete employeeObject._id;
  delete employeeObject.__v;

  return employeeObject;
};

employeeSchema.statics.getUpdatableAttributes = function () {
  return [
    'EmployeeId',
    'FirstName',
    'LastName',
    'Email',
    'PhoneNumber',
    'HireDate',
    'JobId',
    'Salary',
    'CommissionPct',
    'ManagerId',
    'DepartmentId',
    'EmployeeRating',
  ];
};

employeeSchema.statics.getSearchableAttributes = function () {
  return [
    { attr: 'EmployeeId', type: 'Number' },
    { attr: 'FirstName', type: 'String' },
    { attr: 'LastName', type: 'String' },
    { attr: 'Email', type: 'String' },
    { attr: 'PhoneNumber', type: 'String' },
    { attr: 'JobId', type: 'String' },
    { attr: 'Salary', type: 'Number' },
    { attr: 'ManagerId', type: 'Number' },
    { attr: 'DepartmentId', type: 'Number' },
    { attr: 'EmployeeRating', type: 'Number' },
  ];
};

export const Employee = model<IEmployee, IStatics<IEmployee>>(
  'employee',
  employeeSchema,
);
