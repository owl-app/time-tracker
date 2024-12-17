import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
  file_error_log: 'var/logs/error.log',
  file_debug_log: 'var/logs/debug.log',
}));
