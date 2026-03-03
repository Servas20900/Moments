import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const xForwardedFor = req?.headers?.["x-forwarded-for"];
    if (typeof xForwardedFor === "string" && xForwardedFor.length > 0) {
      return xForwardedFor.split(",")[0].trim();
    }

    const cfConnectingIp = req?.headers?.["cf-connecting-ip"];
    if (typeof cfConnectingIp === "string" && cfConnectingIp.length > 0) {
      return cfConnectingIp;
    }

    const realIp = req?.headers?.["x-real-ip"];
    if (typeof realIp === "string" && realIp.length > 0) {
      return realIp;
    }

    return req?.ip || req?.socket?.remoteAddress || "unknown";
  }
}
