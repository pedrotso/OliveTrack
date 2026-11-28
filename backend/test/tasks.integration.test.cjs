const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { test } = require("node:test");

test("creates and retrieves a task through the API using PostgreSQL", { timeout: 15_000 }, async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, "Set TEST_DATABASE_URL to a disposable PostgreSQL database with migrations applied.");
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  const { NestFactory } = require("@nestjs/core");
  const { AppModule } = require("../dist/app.module.js");
  const { PrismaService } = require("../dist/prisma/prisma.service.js");
  const app = await NestFactory.create(AppModule, { abortOnError: false, logger: false });
  const task = {
    id: randomUUID(),
    title: "Integration test task",
    done: false,
    updatedAt: Date.now(),
    deletedAt: null,
  };
  let created = false;
  t.after(async () => {
    try {
      if (created) await app.get(PrismaService).task.deleteMany({ where: { id: task.id } });
    } finally {
      await app.close();
    }
  });

  app.setGlobalPrefix("api");
  await app.listen(0, "127.0.0.1");
  const url = `${await app.getUrl()}/api/tasks`;

  const createResponse = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(task),
    signal: AbortSignal.timeout(5000),
  });
  created = createResponse.status === 201;
  const createdBody = await createResponse.json();
  assert.equal(createResponse.status, 201, JSON.stringify(createdBody));
  assert.deepEqual(createdBody, task);

  const getResponse = await fetch(`${url}/${task.id}`, { signal: AbortSignal.timeout(5000) });
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await getResponse.json(), task);
});
