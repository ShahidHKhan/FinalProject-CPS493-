import { Router } from 'express';
import { create, get, getAll, remove, update } from '../models/stretches';
import type { Stretch } from '../models/stretches';
import { DataEnvelope, DataListEnvelope } from '../types';

const app = Router();

app
  .get('/', (req, res) => {
    const { stretches, count } = getAll(req.query);
    const dataEnvelope: DataListEnvelope<Stretch> = {
      data: stretches,
      isSuccess: true,
      total: count,
    };

    res.send(dataEnvelope);
  })
  .get('/count', (req, res) => {
    const { count } = getAll(req.query);

    res.send({ count });
  })
  .get('/:id', (req, res) => {
    const stretchId = Number.parseInt(req.params.id, 10);

    try {
      const stretch = get(stretchId);
      res.send(stretch);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Stretch not found' });
    }
  })
  .post('/', (req, res) => {
    const newStretch = create(req.body);

    res.status(201).send(newStretch);
  })
  .patch('/:id', (req, res) => {
    const stretchId = Number.parseInt(req.params.id, 10);

    try {
      const updatedStretch = update(stretchId, req.body);
      res.send(updatedStretch);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Stretch not found' });
    }
  })
  .delete('/:id', (req, res) => {
    const stretchId = Number.parseInt(req.params.id, 10);

    try {
      const removedStretch = remove(stretchId);
      const response: DataEnvelope<Stretch> = {
        data: removedStretch,
        isSuccess: true,
        message: `${removedStretch.name} deleted`,
      };

      res.send(response);
    } catch {
      res.status(404).send({ isSuccess: false, message: 'Stretch not found' });
    }
  });

export default app;