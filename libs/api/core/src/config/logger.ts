import { registerAs } from '@nestjs/config';

export const LOGGER_CONFIG_NAME = 'logger';

export default registerAs(LOGGER_CONFIG_NAME, () => ({
  file_error_log: 'var/logs/error.log',
  file_debug_log: 'var/logs/debug.log',
}));
