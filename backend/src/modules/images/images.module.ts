import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { ImagesController } from "./images.controller";
import { ImagesService } from "./images.service";

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
