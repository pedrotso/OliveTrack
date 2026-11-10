import { prisma } from "@/lib/prisma";
import { json, toDto } from "@/lib/http";
import { TaskSchema } from "@app/shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.task.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } });
  return json(rows.map(toDto));
}

export async function POST(req: Request) {
  const parsed = TaskSchema.safeParse(await req.json());
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const t = parsed.data;
  const row = await prisma.task.upsert({
    where: { id: t.id },
    create: { id: t.id, title: t.title, done: t.done, updatedAt: new Date(t.updatedAt) },
    update: { title: t.title, done: t.done, updatedAt: new Date(t.updatedAt), deletedAt: null },
  });
  return json(toDto(row), 201);
}
