import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  done: z.boolean(),
  updatedAt: z.number().int(), // epoch ms
  deletedAt: z.number().int().nullable(),
});
export type Task = z.infer<typeof TaskSchema>;

export const MutationSchema = z.object({
  mutationId: z.string().uuid(),
  entity: z.literal("task"),
  op: z.enum(["upsert", "delete"]),
  data: TaskSchema,
});
export type Mutation = z.infer<typeof MutationSchema>;

export const PushRequestSchema = z.object({ mutations: z.array(MutationSchema).max(500) });
export type PushRequest = z.infer<typeof PushRequestSchema>;

export interface PullResponse {
  tasks: Task[];
  cursor: number;
}
