import { Router } from 'express';
import type { PagingRequest } from '../types';
import { DataEnvelope, DataListEnvelope } from '../types';
import { create, get, getAll, remove, update } from '../models/workoutPresets';
import type { WorkoutPreset } from '../models/workoutPresets';

const app = Router();

app
  .get('/', async (req, res) => {
    try {
      const { list, count } = await getAll(req.query as unknown as PagingRequest);
      const dataEnvelope: DataListEnvelope<WorkoutPreset> = {
        data: list,
        isSuccess: true,
        total: count,
      };

      res.send(dataEnvelope);
    } catch {
      res.status(500).send({ isSuccess: false, message: 'Failed to load workout presets' });
    }
  })
  .get('/count', async (req, res) => {
    try {
      const { count } = await getAll(req.query as unknown as PagingRequest);

      res.send({ count });
    } catch {
      res.status(500).send({ isSuccess: false, message: 'Failed to load workout presets' });
    }
  })
  .get('/:id', async (req, res) => {
    const presetId = Number.parseInt(req.params.id, 10);

    try {
      const preset = await get(presetId);
      res.send(preset);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Workout preset not found' });
    }
  })
  .post('/', async (req, res) => {
    try {
      const newPreset = await create(req.body);

      res.status(201).send(newPreset);
    } catch {
      res.status(500).send({ isSuccess: false, message: 'Failed to create workout preset' });
    }
  })
  .patch('/:id', async (req, res) => {
    const presetId = Number.parseInt(req.params.id, 10);

    try {
      const updatedPreset = await update(presetId, req.body);
      res.send(updatedPreset);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Workout preset not found' });
    }
  })
  .delete('/:id', async (req, res) => {
    const presetId = Number.parseInt(req.params.id, 10);

    try {
      const removedPreset = await remove(presetId);
      const response: DataEnvelope<WorkoutPreset> = {
        data: removedPreset,
        isSuccess: true,
        message: `${removedPreset.name} deleted`,
      };

      res.send(response);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Workout preset not found' });
    }
  });

export default app;
