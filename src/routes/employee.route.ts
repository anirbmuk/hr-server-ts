import { Router, RequestHandler } from 'express';
import { SortOrder } from 'mongoose';
import { HrFilter } from '../types/type';
import guard from './../handlers/guard.mw';
import { Employee, IEmployee } from './../models';

const router = Router();

const sortAttributes: Record<string, Record<string, number>> = {
  directs: { EmployeeId: 1 },
};

const getEmployees: RequestHandler = async (req, res) => {
  const sortBy = req.query.sortBy as string;
  const filter = req.query.filter as string;
  const sortOptions: Record<string, SortOrder> = {};
  const orConditions = [];
  let employeeQuery;
  let employeeCountQuery;
  if (sortBy) {
    const options = sortBy.split(',');
    for (const option of options) {
      const keys = option.split(':');
      sortOptions[keys[0] as string] = keys[1] as SortOrder;
    }
  }
  if (filter) {
    const attributes = Employee.getSearchableAttributes();
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
    employeeQuery = Employee.where().or(orConditions);
    employeeCountQuery = Employee.where().or(orConditions);
  } else {
    employeeQuery = Employee.find();
  }
  try {
    const query = employeeQuery
      .limit(parseInt(req.query.limit as string))
      .skip(parseInt(req.query.skip as string))
      .sort(sortOptions);
    const employees = await query;
    if (!employees) {
      return res.status(404).send({ items: [], estimatedCount: 0 });
    }
    let count = 0;
    if (employeeCountQuery) {
      count = await employeeCountQuery.countDocuments();
    } else {
      count = await Employee.estimatedDocumentCount();
    }
    res.status(200).send({ items: employees, estimatedCount: count });
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const getEmployeeById: RequestHandler<{ id: string }> = async (req, res) => {
  const EmployeeId = parseInt(req.params.id);
  const children = req.query.children as string;
  let expandChildren: string[] = [];
  if (children) {
    expandChildren = children.trim().split(',');
  }
  try {
    const employee = await Employee.findOne({ EmployeeId });
    if (!employee) {
      return res.status(404).send({});
    }
    const responseObject = employee.toJSON() as Partial<IEmployee>;
    if (
      !!expandChildren &&
      Array.isArray(expandChildren) &&
      expandChildren.length > 0
    ) {
      for (const item of expandChildren) {
        await employee.populate({
          path: item,
          options: { sort: sortAttributes[item] },
        });
        responseObject[item] = employee[item];
      }
    }
    res.status(200).send(responseObject);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const addEmployee: RequestHandler = async (req, res) => {
  const newEmployee = new Employee(req.body);
  try {
    await newEmployee.save();
    res.status(201).send(newEmployee);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const updateEmployee: RequestHandler<{ id: string }> = async (req, res) => {
  const allowedAttributes = Employee.getUpdatableAttributes();
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

  const EmployeeId = parseInt(req.params.id);
  try {
    const employee = await Employee.findOne({ EmployeeId });
    if (!employee) {
      return res.status(404).send({ items: [] });
    }

    updateAttributes.forEach(
      attribute => (employee[attribute] = update[attribute]),
    );
    await employee.save();

    res.status(200).send(employee);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const deleteEmployee: RequestHandler<{ id: string }> = async (req, res) => {
  const EmployeeId = parseInt(req.params.id);
  try {
    // const employee = await Employee.findOneAndDelete({ EmployeeId });
    const employee = await Employee.findOne({ EmployeeId });
    if (!employee) {
      return res.status(404).send({ items: [] });
    }
    await employee.deleteOne();
    res.status(200).send(employee);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

router.get('', guard, getEmployees);
router.get('/:id', guard, getEmployeeById);
router.post('', guard, addEmployee);
router.patch('/:id', guard, updateEmployee);
router.delete('/:id', guard, deleteEmployee);

export default router;
