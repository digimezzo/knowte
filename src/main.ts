import { enableProdMode, ViewEncapsulation } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';
import { logRendererStartup } from './app/common/logging/renderer-startup-diagnostics';

const mainEntryTime = performance.now();
if (AppConfig.production) {
  enableProdMode();
}

const bootstrapStartTime = performance.now();
platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  })
  .then(() => logRendererStartup(mainEntryTime, performance.now() - bootstrapStartTime))
  .catch(err => console.error(err));
