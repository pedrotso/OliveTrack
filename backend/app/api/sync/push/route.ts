import { prisma } from "@/lib/prisma";
import { json } from "@/lib/http";
import { PushRequestSchema } from "@app/shared";

export const dynamic = "force-dynamic";

// Idempotente (applied_mutations) e last-write-wins por updatedAt.
export async function POST(req: Request) {
  const parsed = PushRequestSchema.safeParse(await req.json());
  if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);

  const applied: string[] = [];
  for (const m of parsed.data.mutations) {
    await prisma.$transaction(async (tx) => {
      const seen = await tx.appliedMutation.findUnique({ where: { id: m.mutationId } });
      if (!seen) {
        const t = m.data;
        const updatedAt = new Date(t.updatedAt);
        const deletedAt = m.op === "delete" ? updatedAt : null;
        const existing = await tx.task.findUnique({ where: { id: t.id } });
        if (!existing) {
          await tx.task.create({ data: { id: t.id, title: t.title, done: t.done, updatedAt, deletedAt } });
        } else if (existing.updatedAt <= updatedAt) {
          await tx.task.update({ where: { id: t.id }, data: { title: t.title, done: t.done, updatedAt, deletedAt } });
        }
        await tx.appliedMutation.create({ data: { id: m.mutationId } });
      }
    });
    applied.push(m.mutationId);
  }
  return json({ applied });
}
