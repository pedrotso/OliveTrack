import { describe, expect, it, vi } from "vitest";
import { TasksService, toTaskDto } from "./tasks.service";
import { PrismaService } from "../prisma/prisma.service";

describe("toTaskDto", () => {
  it("converte datas em epoch ms e mantém deletedAt nulo", () => {
    const dto = toTaskDto({
      id: "0b5a2f0e-1f0f-4f3f-9d5e-2b0a7c9e1a11",
      title: "Podar",
      done: false,
      updatedAt: new Date(1_700_000_000_000),
      deletedAt: null,
    });
    expect(dto.updatedAt).toBe(1_700_000_000_000);
    expect(dto.deletedAt).toBeNull();
  });
});

describe("TasksService", () => {
  it("changedSince devolve tarefas mapeadas por ordem de updatedAt", async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: "a", title: "A", done: false, updatedAt: new Date(10), deletedAt: null },
      { id: "b", title: "B", done: true, updatedAt: new Date(20), deletedAt: new Date(20) },
    ]);
    const service = new TasksService({ task: { findMany } } as unknown as PrismaService);

    const tasks = await service.changedSince(5);

    expect(findMany).toHaveBeenCalledWith({
      where: { updatedAt: { gt: new Date(5) } },
      orderBy: { updatedAt: "asc" },
      take: 1000,
    });
    expect(tasks.map((t) => t.id)).toEqual(["a", "b"]);
    expect(tasks[1].deletedAt).toBe(20);
  });
});
