"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const http = require("http");
const https = require("https");
const Url = require("url");
function request(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const u = Url.parse(url);
        const options = {
            hostname: u.hostname,
            protocol: u.protocol,
            host: u.host,
            port: u.port,
            path: u.path,
            headers: Object.assign({ 'Accept': 'text/html' }, headers),
        };
        function _callback(res) {
            if (!res.statusCode || res.statusCode >= 400) {
                // Consume the rest of the data to free memory.
                res.resume();
                reject(new Error(`Requesting "${url}" returned status code ${res.statusCode}.`));
            }
            else {
                res.setEncoding('utf8');
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve(data);
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            }
        }
        if (u.protocol == 'https:') {
            options.agent = new https.Agent({ rejectUnauthorized: false });
            https.get(options, _callback);
        }
        else if (u.protocol == 'http:') {
            http.get(options, _callback);
        }
        else {
            throw new Error(`Unknown protocol: ${JSON.stringify(u.protocol)}.`);
        }
    });
}
exports.request = request;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci90ZXN0L3V0aWxzL3JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLDJCQUEyQjtBQUUzQixpQkFBd0IsR0FBVyxFQUFFLE9BQU8sR0FBRyxFQUFFO0lBQy9DLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sT0FBTyxHQUF3QjtZQUNuQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7WUFDcEIsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO1lBQ3BCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtZQUNaLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtZQUNaLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtZQUNaLE9BQU8sa0JBQUksUUFBUSxFQUFFLFdBQVcsSUFBSyxPQUFPLENBQUU7U0FDL0MsQ0FBQztRQUVGLG1CQUFtQixHQUF5QjtZQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM3QywrQ0FBK0M7Z0JBQy9DLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsZUFBZSxHQUFHLDBCQUEwQixHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ25GLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN4QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ3JCLElBQUksSUFBSSxLQUFLLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2dCQUNILEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtvQkFDakIsSUFBSSxDQUFDO3dCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDaEIsQ0FBQztvQkFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNiLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDZCxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDM0IsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RSxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBMUNELDBCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgKiBhcyBVcmwgZnJvbSAndXJsJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVlc3QodXJsOiBzdHJpbmcsIGhlYWRlcnMgPSB7fSk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdSA9IFVybC5wYXJzZSh1cmwpO1xuICAgIGNvbnN0IG9wdGlvbnM6IGh0dHAuUmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICBob3N0bmFtZTogdS5ob3N0bmFtZSxcbiAgICAgIHByb3RvY29sOiB1LnByb3RvY29sLFxuICAgICAgaG9zdDogdS5ob3N0LFxuICAgICAgcG9ydDogdS5wb3J0LFxuICAgICAgcGF0aDogdS5wYXRoLFxuICAgICAgaGVhZGVyczogeyAnQWNjZXB0JzogJ3RleHQvaHRtbCcsIC4uLmhlYWRlcnMgfSxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NhbGxiYWNrKHJlczogaHR0cC5JbmNvbWluZ01lc3NhZ2UpIHtcbiAgICAgIGlmICghcmVzLnN0YXR1c0NvZGUgfHwgcmVzLnN0YXR1c0NvZGUgPj0gNDAwKSB7XG4gICAgICAgIC8vIENvbnN1bWUgdGhlIHJlc3Qgb2YgdGhlIGRhdGEgdG8gZnJlZSBtZW1vcnkuXG4gICAgICAgIHJlcy5yZXN1bWUoKTtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgUmVxdWVzdGluZyBcIiR7dXJsfVwiIHJldHVybmVkIHN0YXR1cyBjb2RlICR7cmVzLnN0YXR1c0NvZGV9LmApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5zZXRFbmNvZGluZygndXRmOCcpO1xuICAgICAgICBsZXQgZGF0YSA9ICcnO1xuICAgICAgICByZXMub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgICAgZGF0YSArPSBjaHVuaztcbiAgICAgICAgfSk7XG4gICAgICAgIHJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodS5wcm90b2NvbCA9PSAnaHR0cHM6Jykge1xuICAgICAgb3B0aW9ucy5hZ2VudCA9IG5ldyBodHRwcy5BZ2VudCh7IHJlamVjdFVuYXV0aG9yaXplZDogZmFsc2UgfSk7XG4gICAgICBodHRwcy5nZXQob3B0aW9ucywgX2NhbGxiYWNrKTtcbiAgICB9IGVsc2UgaWYgKHUucHJvdG9jb2wgPT0gJ2h0dHA6Jykge1xuICAgICAgaHR0cC5nZXQob3B0aW9ucywgX2NhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb3RvY29sOiAke0pTT04uc3RyaW5naWZ5KHUucHJvdG9jb2wpfS5gKTtcbiAgICB9XG4gIH0pO1xufVxuIl19