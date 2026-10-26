import { Module } from '@nestjs/common';
import { OccupancyController } from './occupancy.controller';
import { OccupancyMonitor } from './occupancy-monitor';
import { LoggingObserver } from './observers/logging.observer';
import { AvailabilityObserver } from './observers/availability.observer';

@Module({
  controllers: [OccupancyController],
  providers: [
    LoggingObserver,
    AvailabilityObserver,
    {
      provide: OccupancyMonitor,
      useFactory: (
        logging: LoggingObserver,
        availability: AvailabilityObserver,
      ) => {
        const monitor = new OccupancyMonitor();
        monitor.attach(logging);
        monitor.attach(availability);
        return monitor;
      },
      inject: [LoggingObserver, AvailabilityObserver],
    },
  ],
})
export class OccupancyModule {}
