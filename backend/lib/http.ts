import { NextResponse } from "next/server";
import type { Task } from "@app/shared";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

type Row = { id: string; title: string; done: boolean; updatedAt: Date; deletedAt: Date | null };
export const toDto = (r: Row): Task => ({
  id: r.id,
  title: r.title,
  done: r.done,
  updatedAt: r.updatedAt.getTime(),
  deletedAt: r.deletedAt ? r.deletedAt.getTime() : null,
});
