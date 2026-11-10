import { prisma } from "@/lib/prisma";
import { json, toDto } from "@/lib/http";
import { TaskSchema } from "@app/shared";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const row = await prisma.task.findUnique({ where: { id } });
  return row && !row.deletedAt ? json(toDto(row)) : json({ error: "not found" }, 404);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const parsed = TaskSchema.partial().safeParse(await req.json());
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
  const { title, done } = parsed.data;
  try {
    const row = await prisma.task.update({ where: { id }, data: { title, done, updatedAt: new Date() } });
    return json(toDto(row));
  } catch {
    return json({ error: "not found" }, 404);
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const { id } = await params;
  const now = new Date();
  try {
    await prisma.task.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
    return json({ ok: true });
  } catch {
    return json({ error: "not found" }, 404);
  }
}
