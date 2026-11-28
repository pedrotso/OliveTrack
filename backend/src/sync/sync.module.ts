import { Module } from "@nestjs/common";
import { TasksModule } from "../tasks/tasks.module";
import { SyncController } from "./sync.controller";
import { SyncService } from "./sync.service";

@Module({
  imports: [TasksModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
