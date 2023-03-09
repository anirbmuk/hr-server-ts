import { Router, RequestHandler } from 'express';
import { SortOrder } from 'mongoose';
import { HrFilter } from '../types/type';
import guard from './../handlers/guard.mw';
import { Department, IDepartment } from './../models';

const router = Router();

const sortAttributes: Record<string, Record<string, number>> = {
  employees: { EmployeeId: 1 },
};

const getDepartments: RequestHandler = async (req, res) => {
  const sortBy = req.query.sortBy as string;
  const filter = req.query.filter as string;
  const sortOptions: Record<string, SortOrder> = {};
  const orConditions = [];
  let departmentQuery;
  let departmentCountQuery;
  if (sortBy) {
    const options = sortBy.split(',');
    for (const option of options) {
      const keys = option.split(':');
      sortOptions[keys[0] as string] = keys[1] as SortOrder;
    }
  }
  if (filter) {
    const attributes = Department.getSearchableAttributes();
    for (const attribute of attributes) {
      let addToFilter = false;
      const filterOptions: HrFilter = {};
      if (attribute.type === 'Number' && !isNaN(+filter)) {
        filterOptions[attribute.attr] = +filter;
        addToFilter = true;
      } else if (attribute.type === 'String') {
        filterOptions[attribute.attr] = { $regex: filter, $options: 'i' };
        addToFilter = true;
      }

      if (addToFilter) {
        orConditions.push(filterOptions);
      }
    }
    departmentQuery = Department.where().or(orConditions);
    departmentCountQuery = Department.where().or(orConditions);
  } else {
    departmentQuery = Department.find();
  }
  try {
    const query = departmentQuery
      .limit(parseInt(req.query.limit as string))
      .skip(parseInt(req.query.skip as string))
      .sort(sortOptions);
    const departments = await query;
    if (!departments) {
      return res.status(404).send({ items: [], estimatedCount: 0 });
    }
    let count = 0;
    if (departmentCountQuery) {
      count = await departmentCountQuery.countDocuments();
    } else {
      count = await Department.estimatedDocumentCount();
    }
    res.status(200).send({ items: departments, estimatedCount: count });
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const getDepartmentById: RequestHandler<{ id: string }> = async (req, res) => {
  const DepartmentId = parseInt(req.params.id);
  const children = req.query.children as string;
  let expandChildren: string[] = [];
  if (children) {
    expandChildren = children.trim().split(',');
  }
  try {
    const department = await Department.findOne({ DepartmentId });
    if (!department) {
      return res.status(404).send({});
    }
    const responseObject = department.toJSON() as Partial<IDepartment>;
    if (
      !!expandChildren &&
      Array.isArray(expandChildren) &&
      expandChildren.length > 0
    ) {
      for (const item of expandChildren) {
        await department.populate({
          path: item,
          options: { sort: sortAttributes[item] },
        });
        responseObject[item] = department[item];
      }
    }
    res.status(200).send(responseObject);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const addDepartment: RequestHandler = async (req, res) => {
  const newDepartment = new Department(req.body);
  try {
    await newDepartment.save();
    res.status(201).send(newDepartment);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const updateDepartment: RequestHandler<{ id: string }> = async (req, res) => {
  const allowedAttributes = Department.getUpdatableAttributes();
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

  const DepartmentId = parseInt(req.params.id);
  try {
    const department = await Department.findOne({ DepartmentId });
    if (!department) {
      return res.status(404).send({ items: [] });
    }

    updateAttributes.forEach(
      attribute => (department[attribute] = update[attribute]),
    );
    await department.save();

    res.status(200).send(department);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const deleteDepartment: RequestHandler<{ id: string }> = async (req, res) => {
  const DepartmentId = parseInt(req.params.id);
  try {
    // const department = await Department.findOneAndDelete({ DepartmentId });
    const department = await Department.findOne({ DepartmentId });
    if (!department) {
      return res.status(404).send();
    }
    // await Employee.deleteMany({ DepartmentId: department.DepartmentId });
    await department.deleteOne();
    res.status(200).send(department);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

router.get('', guard, getDepartments);
router.get('/:id', guard, getDepartmentById);
router.post('', guard, addDepartment);
router.patch('/:id', guard, updateDepartment);
router.delete('/:id', guard, deleteDepartment);

export default router;
