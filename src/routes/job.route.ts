import { Router, RequestHandler } from 'express';
import { SortOrder } from 'mongoose';
import guard from './../handlers/guard.mw';
import { Job } from './../models';

const router = Router();

const getJobs: RequestHandler = async (req, res) => {
  const sortBy = req.query.sortBy as string;
  const sortOptions: Record<string, SortOrder> = {};
  if (sortBy) {
    const options = sortBy.split(',');
    for (const option of options) {
      const keys = option.split(':');
      sortOptions[keys[0] as string] = keys[1] as SortOrder;
    }
  }
  try {
    const jobs = await Job.find()
      .limit(parseInt(req.query.limit as string))
      .skip(parseInt(req.query.skip as string))
      .sort(sortOptions);
    if (!jobs) {
      return res.status(404).send({ items: [], estimatedCount: 0 });
    }
    const estimatedCount = await Job.estimatedDocumentCount();
    res.status(200).send({ items: jobs, estimatedCount });
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const addJob: RequestHandler = async (req, res) => {
  const newJob = new Job(req.body);
  try {
    await newJob.save();
    res.status(201).send(newJob);
  } catch (error: unknown) {
    res.status(500).send({ error: (error as Error).message });
  }
};

router.get('', guard, getJobs);
router.post('', guard, addJob);

export default router;
