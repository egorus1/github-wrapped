import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: true,
});

fastify.get('/api/health', async () => {
  return { status: 'ok' };
});

fastify.get('/api/hello', async () => {
  return { message: 'Hello from Fastify!' };
});

fastify.get('/api/get-data', async (request, reply) => {
  const { username } = request.query as { username?: string };

  if (!username) {
    reply.code(400);
    return { error: 'Username is required' };
  }

  try {
    const year = new Date().getFullYear();
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`
    );

    if (!response.ok) {
      reply.code(404);
      return { error: 'User not found or API error' };
    }

    const data = await response.json();

    return {
      username,
      contributions: data.contributions,
      total: data.total?.[year] || 0
    };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500);
    return { error: 'Failed to fetch GitHub data' };
  }
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
