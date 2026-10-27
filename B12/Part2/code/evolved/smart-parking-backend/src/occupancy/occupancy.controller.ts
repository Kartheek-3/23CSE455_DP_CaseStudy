import { Body, Controller, Param, Post } from '@nestjs/common';
import { OccupancyMonitor } from './occupancy-monitor';

@Controller('occupancy')
export class OccupancyController {
  constructor(private readonly monitor: OccupancyMonitor) {}

  @Post(':slotId/status')
  report(@Param('slotId') slotId: string, @Body('status') status: string) {
    return this.monitor.report(+slotId, status);
  }
}
