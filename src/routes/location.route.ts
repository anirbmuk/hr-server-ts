import { Router, RequestHandler } from 'express';
import guard from './../handlers/guard.mw';
import { HrFilter } from '../types/type';
import { Location, ILocation } from './../models';

const sortAttributes: Record<string, Record<string, number>> = {
  departments: { DepartmentId: 1 },
};

const router = Router();

const getLocations: RequestHandler = async (req, res) => {
  const sortBy = req.query.sortBy as string;
  const filter = req.query.filter as string;
  const sortOptions: Record<string, number> = {};
  const orConditions = [];
  let locationQuery;
  let locationCountQuery;

  if (sortBy) {
    const options = sortBy.split(',');
    for (const option of options) {
      const keys = option.split(':');
      sortOptions[keys[0]] = +keys[1];
    }
  }
  if (filter) {
    const attributes = Location.getSearchableAttributes();
    for (const attribute of attributes) {
      let addToFilter = false;
      const filterOptions: HrFilter = {};
      if (attribute.type === 'Number' && !isNaN(+filter)) {
        filterOptions[attribute.attr] = +filter;
        addToFilter = true;
      } else if (attribute.type === 'String') {
        filterOptions[attribute.attr] = {
          $regex: filter as string,
          $options: 'i',
        };
        addToFilter = true;
      }

      if (addToFilter) {
        orConditions.push(filterOptions);
      }
    }
    locationQuery = Location.where().or(orConditions);
    locationCountQuery = Location.where().or(orConditions);
  } else {
    locationQuery = Location.find();
  }
  try {
    const query = locationQuery
      .limit(parseInt(req.query.limit as string))
      .skip(parseInt(req.query.skip as string))
      .sort(sortOptions);
    const locations = await query;
    if (!locations) {
      return res.status(404).send({ items: [], estimatedCount: 0 });
    }
    let count = 0;
    if (locationCountQuery) {
      count = await locationCountQuery.countDocuments();
    } else {
      count = await Location.estimatedDocumentCount();
    }
    res.status(200).send({ items: locations, estimatedCount: count });
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const getLocationById: RequestHandler<{ id: string }> = async (req, res) => {
  const LocationId = parseInt(req.params.id);
  const children = req.query.children as string;
  let expandChildren: string[] = [];
  if (children) {
    expandChildren = children.trim().split(',');
  }
  try {
    const location = await Location.findOne({ LocationId });
    if (!location) {
      return res.status(404).send({});
    }
    const responseObject = location.toJSON() as Partial<ILocation>;
    if (
      !!expandChildren &&
      Array.isArray(expandChildren) &&
      expandChildren.length > 0
    ) {
      for (const item of expandChildren) {
        await location.populate({
          path: item,
          options: { sort: sortAttributes[item] },
        });
        responseObject[item] = location[item];
      }
    }
    res.status(200).send(responseObject);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const addLocation: RequestHandler = async (req, res) => {
  const newLocation = new Location(req.body);
  try {
    await newLocation.save();
    res.status(201).send(newLocation);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const updateLocation: RequestHandler<{ id: string }> = async (req, res) => {
  const allowedAttributes = Location.getUpdatableAttributes();
  const update = req.body;
  const updateAttributes = Object.keys(update);

  const isValidOperation = updateAttributes.every(each =>
    allowedAttributes.includes(each),
  );
  if (!isValidOperation) {
    return res.status(400).send({
      error: 'Attempting to update restricted or non-existent attributes',
    });
  }

  const LocationId = parseInt(req.params.id);
  try {
    const location = await Location.findOne({ LocationId });
    if (!location) {
      return res.status(404).send({ items: [] });
    }

    updateAttributes.forEach(
      attribute => (location[attribute] = update[attribute]),
    );
    await location.save();

    res.status(200).send(location);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const deleteLocation: RequestHandler<{ id: string }> = async (req, res) => {
  const LocationId = parseInt(req.params.id);
  try {
    const location = await Location.findOne({ LocationId });
    if (!location) {
      return res.status(404).send({ items: [] });
    }
    // await Department.deleteMany({ LocationId: location.LocationId });
    await location.remove();
    res.status(200).send(location);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

router.get('', guard, getLocations);
router.get('/:id', guard, getLocationById);
router.post('', guard, addLocation);
router.patch('/:id', guard, updateLocation);
router.delete('/:id', guard, deleteLocation);

export default router;
