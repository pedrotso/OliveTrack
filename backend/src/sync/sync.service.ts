import { Injectable } from "@nestjs/common";
import type { Mutation, PullResponse } from "@app/shared";
import { PrismaService } from "../prisma/prisma.service";
import { TasksService } from "../tasks/tasks.service";

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: TasksService,
  ) {}

  /** Idempotente por mutationId e last-write-wins por updatedAt. */
  async push(mutations: Mutation[]): Promise<{ applied: string[] }> {
    const applied: string[] = [];
    for (const m of mutations) {
      await this.prisma.$transaction(async (tx) => {
        const seen = await tx.appliedMutation.findUnique({ where: { id: m.mutationId } });
        if (!seen) {
          const t = m.data;
          const updatedAt = new Date(t.updatedAt);
          const deletedAt = m.op === "delete" ? updatedAt : null;
          const existing = await tx.task.findUnique({ where: { id: t.id } });
          if (!existing) {
            await tx.task.create({
              data: { id: t.id, title: t.title, done: t.done, updatedAt, deletedAt },
            });
          } else if (existing.updatedAt <= updatedAt) {
            await tx.task.update({
              where: { id: t.id },
              data: { title: t.title, done: t.done, updatedAt, deletedAt },
            });
          }
          await tx.appliedMutation.create({ data: { id: m.mutationId } });
        }
      });
      applied.push(m.mutationId);
    }
    return { applied };
  }

  /** Cursor = maior updatedAt (epoch ms) devolvido; inclui registos apagados (soft delete). */
  async pull(since: number): Promise<PullResponse> {
    const tasks = await this.tasks.changedSince(since);
    const cursor = tasks.length ? tasks[tasks.length - 1].updatedAt : since;
    return { tasks, cursor };
  }
}
