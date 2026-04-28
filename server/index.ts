import 'dotenv/config';

import express from 'express';
import stretchesController from './controller/stretches';
import usersController from './controller/users';
import workoutsController from './controller/workouts';
import workoutPresetsController from './controller/workoutPresets';
import { requireAuth, validateJWT } from "./middleware/auth"

const PORT = process.env.PORT ?? 3000
const SERVER = process.env.SERVER ?? 'localhost'
const STATIC_DIR = process.env.STATIC_DIR ?? 'client/dist'

const app = express();

// Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === "OPTIONS") {
            res.sendStatus(200)
            return
        }

    next();
});

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(validateJWT); // Middleware to validate JWT and attach user info to the request

app.use(express.static(STATIC_DIR));

app.use('/api/v1/users', usersController);
app.use('/api/v1/stretches', stretchesController);
app.use('/api/v1/workouts', workoutsController);
app.use('/api/v1/workout-presets', workoutPresetsController);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get("/suny", (req, res) => {
    res.send("Welcome to SUNY!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://${SERVER}:${PORT}`);
});

console.log('Listening for requests...');
