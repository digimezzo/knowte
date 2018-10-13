# @ngx-translate/http-loader [![Build Status](https://travis-ci.org/ngx-translate/http-loader.svg?branch=master)](https://travis-ci.org/ngx-translate/http-loader) [![npm version](https://badge.fury.io/js/%40ngx-translate%2Fhttp-loader.svg)](https://badge.fury.io/js/%40ngx-translate%2Fhttp-loader)

A loader for [ngx-translate](https://github.com/ngx-translate/core) that loads translations using http.

Get the complete changelog here: https://github.com/ngx-translate/http-loader/releases

* [Installation](#installation)
* [Usage](#usage)

## Installation

We assume that you already installed [ngx-translate](https://github.com/ngx-translate/core).

Now you need to install the npm module for `TranslateHttpLoader`:

```sh
npm install @ngx-translate/http-loader --save
```

**if you're still on Angular <4.3, please use Http from @angular/http with http-loader@0.1.0.**

**If you're still using Angular v5, please use ngx-translate 9.x and http-loader 2.x, version 3 and above are only compatible with Angular v6. If you need to use RxJS 5, update to 5.6 and use the rxjs-compat library (see [the RxJS update guide](https://docs.google.com/document/d/12nlLt71VLKb-z3YaSGzUfx6mJbc34nsMXtByPUN35cg/preview#)).**

## Usage
#### 1. Setup the `TranslateModule` to use the `TranslateHttpLoader`:

The `TranslateHttpLoader` uses HttpClient to load translations, which means that you have to import the HttpClientModule from `@angular/common/http` before the `TranslateModule`:

```ts
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AppComponent} from "./app";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

The `TranslateHttpLoader` also has two optional parameters:
- prefix: string = "/assets/i18n/"
- suffix: string = ".json"

By using those default parameters, it will load your translations files for the lang "en" from: `/assets/i18n/en.json`.

You can change those in the `HttpLoaderFactory` method that we just defined. For example if you want to load the "en" translations from `/public/lang-files/en-lang.json` you would use:

```ts
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, "/public/lang-files/", "-lang.json");
}
```

For now this loader only support the json format.

## Angular CLI/Webpack TranslateLoader Example
If you are using Angular CLI (uses webpack under the hood) you can write your own `TranslateLoader` that always loads the latest translation file available during your application build.

```typescript
// webpack-translate-loader.ts
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

export class WebpackTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return Observable.fromPromise(System.import(`../assets/i18n/${lang}.json`));
  }
}
```

Cause `System` will not be available you need to add it to your custom `typings.d.ts`:
```typescript
declare var System: System;
interface System {
  import(request: string): Promise<any>;
}
```

Now you can use the `WebpackTranslateLoader` with your `app.module`:
```typescript
@NgModule({
  bootstrap: [AppComponent],
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: WebpackTranslateLoader
      }
    })
  ]
})
export class AppModule { }
```

The disadvantage of this solution is that you have to rebuild the application everytime your translate files has changes.
