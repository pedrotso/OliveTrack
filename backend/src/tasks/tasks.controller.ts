import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import { TaskSchema } from "@app/shared";
import { TasksService } from "./tasks.service";

const PatchSchema = TaskSchema.partial();

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list() {
    return this.tasks.list();
  }

  @Get(":id")
  async find(@Param("id", new ParseUUIDPipe()) id: string) {
    const task = await this.tasks.find(id);
    if (!task) throw new NotFoundException({ error: "not found" });
    return task;
  }

  @Post()
  async create(@Body() body: unknown) {
    const parsed = TaskSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ error: parsed.error.flatten() });
    return this.tasks.upsert(parsed.data);
  }

  @Put(":id")
  async update(@Param("id", new ParseUUIDPipe()) id: string, @Body() body: unknown) {
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException({ error: parsed.error.flatten() });
    const { title, done } = parsed.data;
    const task = await this.tasks.patch(id, { title, done });
    if (!task) throw new NotFoundException({ error: "not found" });
    return task;
  }

  @Delete(":id")
  @HttpCode(200)
  async remove(@Param("id", new ParseUUIDPipe()) id: string) {
    const ok = await this.tasks.softDelete(id);
    if (!ok) throw new NotFoundException({ error: "not found" });
    return { ok: true };
  }
}
