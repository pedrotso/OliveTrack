import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Task } from "@app/shared";
import { PrismaService } from "../prisma/prisma.service";

type TaskRow = {
  id: string;
  title: string;
  done: boolean;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const toTaskDto = (r: TaskRow): Task => ({
  id: r.id,
  title: r.title,
  done: r.done,
  updatedAt: r.updatedAt.getTime(),
  deletedAt: r.deletedAt ? r.deletedAt.getTime() : null,
});

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(toTaskDto);
  }

  async find(id: string): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({ where: { id } });
    return row && !row.deletedAt ? toTaskDto(row) : null;
  }

  async upsert(t: Task): Promise<Task> {
    const row = await this.prisma.task.upsert({
      where: { id: t.id },
      create: { id: t.id, title: t.title, done: t.done, updatedAt: new Date(t.updatedAt) },
      update: {
        title: t.title,
        done: t.done,
        updatedAt: new Date(t.updatedAt),
        deletedAt: t.deletedAt ? new Date(t.deletedAt) : null,
      },
    });
    return toTaskDto(row);
  }

  async patch(id: string, data: { title?: string; done?: boolean }): Promise<Task | null> {
    try {
      const row = await this.prisma.task.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      });
      return toTaskDto(row);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
      throw e;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    const now = new Date();
    try {
      await this.prisma.task.update({ where: { id }, data: { deletedAt: now, updatedAt: now } });
      return true;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
      throw e;
    }
  }

  /** Registos alterados depois de `since` (epoch ms), incluindo apagados, por ordem de updatedAt. */
  async changedSince(since: number, take = 1000): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      where: { updatedAt: { gt: new Date(since) } },
      orderBy: { updatedAt: "asc" },
      take,
    });
    return rows.map(toTaskDto);
  }
}
