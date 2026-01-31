import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";

/**
 * Catch-all controller for SPA routing
 * Serves index.html for all non-API routes
 * Must be registered LAST in the module to avoid intercepting API routes
 */
@Controller()
export class StaticController {
  @Get("*")
  serveSPA(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), "..", "public", "index.html"));
  }
}
