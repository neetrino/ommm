import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EhdmApiClient } from './ehdm-api.client';
import { EhdmConfig } from './ehdm.config';

@Injectable()
export class EhdmHealthService implements OnModuleInit {
  private readonly logger = new Logger(EhdmHealthService.name);

  constructor(
    private readonly config: EhdmConfig,
    private readonly apiClient: EhdmApiClient,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.config.isFullyConfigured()) {
      this.logger.warn('EHDM is not fully configured; fiscal print is skipped');
      return;
    }
    try {
      const response = await this.apiClient.checkConnection(
        this.config.getCrn(),
      );
      if (response.code !== 0) {
        this.logger.warn(
          `EHDM checkConnection failed: ${response.errorMessage ?? response.message ?? response.code}`,
        );
        return;
      }
      this.logger.log('EHDM checkConnection succeeded');
    } catch (error) {
      this.logger.warn(
        `EHDM checkConnection request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
