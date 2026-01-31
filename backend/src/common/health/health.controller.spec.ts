import { HealthController } from './health.controller';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let prismaHealthIndicator: PrismaHealthIndicator;
  let prismaService: PrismaService;

  beforeEach(() => {
    healthCheckService = {
      check: jest.fn(),
    } as any;

    prismaHealthIndicator = {
      pingCheck: jest.fn(),
    } as any;

    prismaService = {} as any;

    controller = new HealthController(
      healthCheckService,
      prismaHealthIndicator,
      prismaService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should call health check with database indicator', async () => {
      const mockHealthResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
      };

      (healthCheckService.check as jest.Mock).mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockHealthResult);
    });
  });
});
