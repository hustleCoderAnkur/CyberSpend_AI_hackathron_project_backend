
import type { Request, Response } from "express";

export function getHealth(
  _req: Request,
  res: Response
): void {
  res.status(200).json({
    success: true,
    message: "CyberSpend AI API is running",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
}
