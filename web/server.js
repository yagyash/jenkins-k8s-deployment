const express = require('express');
const { createClient } = require('redis');

const app = express();
const port = 3000;

// Connect to Redis inside cluster
const redisClient = createClient({ url: 'redis://redis-service:6379' });
redisClient.connect().catch(console.error);

app.get('/', async (req, res) => {
  try {
    await redisClient.set('hello', 'world');
    const value = await redisClient.get('hello');
    res.send(`Hello from WebApp! Redis says: ${value}`);
  } catch (err) {
    res.status(500).send('Redis connection failed: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`✅ WebApp running on http://0.0.0.0:${port}`);
});
