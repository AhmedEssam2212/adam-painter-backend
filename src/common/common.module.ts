import { Module } from '@nestjs/common';
import { ValidationService } from './services/validation.service';
import { PainterSelectionService } from './strategies/painter-selection.strategy';

@Module({
  providers: [
    // Core Services
    ValidationService,
    PainterSelectionService,
  ],
  exports: [
    // Export services that other modules need
    ValidationService,
    PainterSelectionService,
  ],
})
export class CommonModule {}
