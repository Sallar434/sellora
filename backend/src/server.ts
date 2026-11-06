import { config } from './lib/config';
import { createApp } from './app';
import { startQueue } from './jobs/queue';
import { startScheduler } from './jobs/scheduler';
startQueue(); startScheduler();
createApp().listen(config.port, () => console.log(`Sellora API on :${config.port}  docs: ${config.publicUrl}/docs`));
