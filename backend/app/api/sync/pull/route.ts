import { prisma } from "@/lib/prisma";
import { json, toDto } from "@/lib/http";
import type { PullResponse } from "@app/shared";

export const dynamic = "force-dynamic";

// O cursor é o maior updatedAt (epoch ms) devolvido; inclui registos apagados (soft delete).
export async function GET(req: Request) {
  const since = Number(new URL(req.url).searchParams.get("since") ?? 0) || 0;
  const rows = await prisma.task.findMany({
    where: { updatedAt: { gt: new Date(since) } },
    orderBy: { updatedAt: "asc" },
    take: 1000,
  });
  const body: PullResponse = {
    tasks: rows.map(toDto),
    cursor: rows.length ? rows[rows.length - 1].updatedAt.getTime() : since,
  };
  return json(body);
}
