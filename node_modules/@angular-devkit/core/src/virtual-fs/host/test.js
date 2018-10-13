"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const __1 = require("..");
const buffer_1 = require("./buffer");
const memory_1 = require("./memory");
const sync_1 = require("./sync");
class TestHost extends memory_1.SimpleMemoryHost {
    constructor(map = {}) {
        super();
        for (const filePath of Object.getOwnPropertyNames(map)) {
            this._write(__1.normalize(filePath), buffer_1.stringToFileBuffer(map[filePath]));
        }
    }
    get files() {
        const sync = this.sync;
        function _visit(p) {
            return sync.list(p)
                .map(fragment => __1.join(p, fragment))
                .reduce((files, path) => {
                if (sync.isDirectory(path)) {
                    return files.concat(_visit(path));
                }
                else {
                    return files.concat(path);
                }
            }, []);
        }
        return _visit(__1.normalize('/'));
    }
    get sync() {
        if (!this._sync) {
            this._sync = new sync_1.SyncDelegateHost(this);
        }
        return this._sync;
    }
}
exports.TestHost = TestHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsicGFja2FnZXMvYW5ndWxhcl9kZXZraXQvY29yZS9zcmMvdmlydHVhbC1mcy9ob3N0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0dBTUc7QUFDSCwwQkFBMkM7QUFDM0MscUNBQThDO0FBQzlDLHFDQUE0QztBQUM1QyxpQ0FBMEM7QUFFMUMsY0FBc0IsU0FBUSx5QkFBZ0I7SUFHNUMsWUFBWSxNQUFrQyxFQUFFO1FBQzlDLEtBQUssRUFBRSxDQUFDO1FBRVIsR0FBRyxDQUFDLENBQUMsTUFBTSxRQUFRLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSwyQkFBa0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ1AsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN2QixnQkFBZ0IsQ0FBTztZQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ2hCLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQUksQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ2xDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNOLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1QixDQUFDO1lBQ0gsQ0FBQyxFQUFFLEVBQVksQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSx1QkFBZ0IsQ0FBSyxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBbkNELDRCQW1DQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IFBhdGgsIGpvaW4sIG5vcm1hbGl6ZSB9IGZyb20gJy4uJztcbmltcG9ydCB7IHN0cmluZ1RvRmlsZUJ1ZmZlciB9IGZyb20gJy4vYnVmZmVyJztcbmltcG9ydCB7IFNpbXBsZU1lbW9yeUhvc3QgfSBmcm9tICcuL21lbW9yeSc7XG5pbXBvcnQgeyBTeW5jRGVsZWdhdGVIb3N0IH0gZnJvbSAnLi9zeW5jJztcblxuZXhwb3J0IGNsYXNzIFRlc3RIb3N0IGV4dGVuZHMgU2ltcGxlTWVtb3J5SG9zdCB7XG4gIHByb3RlY3RlZCBfc3luYzogU3luY0RlbGVnYXRlSG9zdDx7fT47XG5cbiAgY29uc3RydWN0b3IobWFwOiB7IFtwYXRoOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWFwKSkge1xuICAgICAgdGhpcy5fd3JpdGUobm9ybWFsaXplKGZpbGVQYXRoKSwgc3RyaW5nVG9GaWxlQnVmZmVyKG1hcFtmaWxlUGF0aF0pKTtcbiAgICB9XG4gIH1cblxuICBnZXQgZmlsZXMoKTogUGF0aFtdIHtcbiAgICBjb25zdCBzeW5jID0gdGhpcy5zeW5jO1xuICAgIGZ1bmN0aW9uIF92aXNpdChwOiBQYXRoKTogUGF0aFtdIHtcbiAgICAgIHJldHVybiBzeW5jLmxpc3QocClcbiAgICAgICAgLm1hcChmcmFnbWVudCA9PiBqb2luKHAsIGZyYWdtZW50KSlcbiAgICAgICAgLnJlZHVjZSgoZmlsZXMsIHBhdGgpID0+IHtcbiAgICAgICAgICBpZiAoc3luYy5pc0RpcmVjdG9yeShwYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbGVzLmNvbmNhdChfdmlzaXQocGF0aCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZXMuY29uY2F0KHBhdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgW10gYXMgUGF0aFtdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3Zpc2l0KG5vcm1hbGl6ZSgnLycpKTtcbiAgfVxuXG4gIGdldCBzeW5jKCkge1xuICAgIGlmICghdGhpcy5fc3luYykge1xuICAgICAgdGhpcy5fc3luYyA9IG5ldyBTeW5jRGVsZWdhdGVIb3N0PHt9Pih0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fc3luYztcbiAgfVxufVxuIl19