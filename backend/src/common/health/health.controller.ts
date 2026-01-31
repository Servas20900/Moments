import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import {
  HealthCheck,
  HealthCheckError,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { v2 as cloudinary } from "cloudinary";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Check API health status with database connectivity" })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
      () => this.cloudinaryHealth(),
    ]);
  }

  private async cloudinaryHealth(): Promise<HealthIndicatorResult> {
    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET");

    // Skip gracefully if not configured (dev/local without Cloudinary)
    if (!cloudName || !apiKey || !apiSecret) {
      return { cloudinary: { status: "up", message: "Cloudinary env not set (skipped)" } };
    }

    // Ensure SDK is configured before ping
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    try {
      const res = await cloudinary.api.ping();
      return { cloudinary: { status: "up", response_time: res.response_time } };
    } catch (error) {
      throw new HealthCheckError("cloudinary failed", error as Error);
    }
  }
}
