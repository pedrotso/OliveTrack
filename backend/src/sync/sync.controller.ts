import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { PushRequestSchema } from "@app/shared";
import { SyncService } from "./sync.service";

@Controller("sync")
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post("push")
  async push(@Body() body: unknown) {
    const parsed = PushRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ error: parsed.error.flatten() });
    return this.sync.push(parsed.data.mutations);
  }

  @Get("pull")
  pull(@Query("since") since?: string) {
    return this.sync.pull(Number(since ?? 0) || 0);
  }
}
