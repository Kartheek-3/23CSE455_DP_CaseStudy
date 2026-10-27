import { Controller, Get, Param, Post } from '@nestjs/common';
import { ChargingService, ChargingAction } from './charging.service';

@Controller('charging')
export class ChargingController {
  constructor(private readonly chargingService: ChargingService) {}

  @Post(':slotId')
  open(@Param('slotId') slotId: string) {
    return this.chargingService.open(+slotId);
  }

  @Get(':slotId')
  status(@Param('slotId') slotId: string) {
    return this.chargingService.get(+slotId);
  }

  @Post(':slotId/:action')
  act(@Param('slotId') slotId: string, @Param('action') action: ChargingAction) {
    return this.chargingService.apply(+slotId, action);
  }
}
