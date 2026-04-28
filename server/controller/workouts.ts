import { Router } from 'express';
import type { PagingRequest } from '../types';
import { DataEnvelope, DataListEnvelope } from '../types';
import { create, get, getAll, remove, update } from '../models/workouts';
import type { Workout } from '../models/workouts';

const app = Router();

app
  .get('/', async (req, res) => {
    try {
      const { list, count } = await getAll(req.query as unknown as PagingRequest);
      const dataEnvelope: DataListEnvelope<Workout> = {
        data: list,
        isSuccess: true,
        total: count,
      };

      res.send(dataEnvelope);
    } catch {
      res.status(500).send({ isSuccess: false, message: 'Failed to load workouts' });
    }
  })
  .get('/count', async (req, res) => {
    try {
      const { count } = await getAll(req.query as unknown as PagingRequest);

      res.send({ count });
    } catch {
      res.status(500).send({ isSuccess: false, message: 'Failed to load workouts' });
    }
  })
  .get('/:id', async (req, res) => {
    const workoutId = Number.parseInt(req.params.id, 10);

    try {
      const workout = await get(workoutId);
      res.send(workout);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Workout not found' });
    }
  })
  .post('/', async (req, res) => {
    try {
      const newWorkout = await create(req.body);

      res.status(201).send(newWorkout);
    } catch {
      res.status(500).send({ isSuccess: false, message: 'Failed to create workout' });
    }
  })
  .patch('/:id', async (req, res) => {
    const workoutId = Number.parseInt(req.params.id, 10);

    try {
      const updatedWorkout = await update(workoutId, req.body);
      res.send(updatedWorkout);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Workout not found' });
    }
  })
  .delete('/:id', async (req, res) => {
    const workoutId = Number.parseInt(req.params.id, 10);

    try {
      const removedWorkout = await remove(workoutId);
      const response: DataEnvelope<Workout> = {
        data: removedWorkout,
        isSuccess: true,
        message: `${removedWorkout.title} deleted`,
      };

      res.send(response);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Workout not found' });
    }
  });

export default app;
