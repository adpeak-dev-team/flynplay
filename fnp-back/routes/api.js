export default async function apiRoutes(fastify, opts) {
  fastify.get('/', async (request, reply) => {
    return { message: 'Hello from /api/hello' };
  });

  fastify.get('/users/:id', async (request, reply) => {
    const { id } = request.params;
    return { id, name: `user-${id}` };
  });

  fastify.post('/echo', async (request, reply) => {
    return { received: request.body };
  });
}
