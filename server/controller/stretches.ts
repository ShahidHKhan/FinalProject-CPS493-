import { Router } from 'express';
import { get, getAll } from '../models/stretches';

const app = Router();

app
  .get('/', (_req, res) => {
    const { stretches } = getAll();

    res.send(stretches);
  })
  .get('/count', (_req, res) => {
    const { count } = getAll();

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
  });

export default app;