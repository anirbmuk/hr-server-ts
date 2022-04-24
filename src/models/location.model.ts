import { Schema, model } from 'mongoose';

import { IBase, IStatics } from '.';

export interface ILocation extends IBase<ILocation> {
  LocationId: number;
  StreetAddress: string;
  PostalCode: string;
  City: string;
  StateProvince: string;
  CountryId: string;
  [key: string]: unknown;
}

const locationSchema = new Schema<ILocation, IStatics<ILocation>>(
  {
    LocationId: {
      type: Number,
      required: true,
      trim: true,
      unique: true,
    },
    StreetAddress: {
      type: String,
      trim: true,
    },
    PostalCode: {
      type: String,
      trim: true,
      maxlength: [12, 'PostalCode can be of max 12 characters'],
    },
    City: {
      type: String,
      required: true,
      trim: true,
    },
    StateProvince: {
      type: String,
      trim: true,
    },
    CountryId: {
      type: String,
      trim: true,
      maxlength: [2, 'CountryId can be of max 2 characters'],
    },
  },
  {
    timestamps: true,
  },
);

locationSchema.virtual('departments', {
  ref: 'department',
  localField: 'LocationId',
  foreignField: 'LocationId',
});

locationSchema.methods.toJSON = function () {
  const location = this;
  const locationObject = location.toObject();

  delete locationObject._id;
  delete locationObject.__v;

  return locationObject;
};

locationSchema.statics.getUpdatableAttributes = function () {
  return [
    'LocationId',
    'StreetAddress',
    'PostalCode',
    'City',
    'StateProvince',
    'CountryId',
  ];
};

locationSchema.statics.getSearchableAttributes = function () {
  return [
    { attr: 'LocationId', type: 'Number' },
    { attr: 'StreetAddress', type: 'String' },
    { attr: 'PostalCode', type: 'String' },
    { attr: 'City', type: 'String' },
    { attr: 'StateProvince', type: 'String' },
    { attr: 'CountryId', type: 'String' },
  ];
};

export const Location = model<ILocation, IStatics<ILocation>>(
  'location',
  locationSchema,
);
