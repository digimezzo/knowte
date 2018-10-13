"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("../path");
/**
 * A Virtual Host that allow to alias some paths to other paths.
 *
 * This does not verify, when setting an alias, that the target or source exist. Neither does it
 * check whether it's a file or a directory. Please not that directories are also renamed/replaced.
 *
 * No recursion is done on the resolution, which means the following is perfectly valid then:
 *
 * ```
 *     host.aliases.set(normalize('/file/a'), normalize('/file/b'));
 *     host.aliases.set(normalize('/file/b'), normalize('/file/a'));
 * ```
 *
 * This will result in a proper swap of two files for each others.
 *
 * @example
 *   const host = new SimpleMemoryHost();
 *   host.write(normalize('/some/file'), content).subscribe();
 *
 *   const aHost = new AliasHost(host);
 *   aHost.read(normalize('/some/file'))
 *     .subscribe(x => expect(x).toBe(content));
 *   aHost.aliases.set(normalize('/some/file'), normalize('/other/path');
 *
 *   // This file will not exist because /other/path does not exist.
 *   aHost.read(normalize('/some/file'))
 *     .subscribe(undefined, err => expect(err.message).toMatch(/does not exist/));
 *
 * @example
 *   const host = new SimpleMemoryHost();
 *   host.write(normalize('/some/folder/file'), content).subscribe();
 *
 *   const aHost = new AliasHost(host);
 *   aHost.read(normalize('/some/folder/file'))
 *     .subscribe(x => expect(x).toBe(content));
 *   aHost.aliases.set(normalize('/some'), normalize('/other');
 *
 *   // This file will not exist because /other/path does not exist.
 *   aHost.read(normalize('/some/folder/file'))
 *     .subscribe(undefined, err => expect(err.message).toMatch(/does not exist/));
 *
 *   // Create the file with new content and verify that this has the new content.
 *   aHost.write(normalize('/other/folder/file'), content2).subscribe();
 *   aHost.read(normalize('/some/folder/file'))
 *     .subscribe(x => expect(x).toBe(content2));
 */
class AliasHost {
    constructor(_delegate) {
        this._delegate = _delegate;
        this._aliases = new Map();
    }
    _resolve(path) {
        let maybeAlias = this._aliases.get(path);
        const sp = path_1.split(path);
        const remaining = [];
        // Also resolve all parents of the requested files, only picking the first one that matches.
        // This can have surprising behaviour when aliases are inside another alias. It will always
        // use the closest one to the file.
        while (!maybeAlias && sp.length > 0) {
            const p = path_1.join(path_1.NormalizedRoot, ...sp);
            maybeAlias = this._aliases.get(p);
            if (maybeAlias) {
                maybeAlias = path_1.join(maybeAlias, ...remaining);
            }
            // Allow non-null-operator because we know sp.length > 0 (condition on while).
            remaining.unshift(sp.pop()); // tslint:disable-line:non-null-operator
        }
        return maybeAlias || path;
    }
    get aliases() { return this._aliases; }
    get capabilities() { return this._delegate.capabilities; }
    write(path, content) {
        return this._delegate.write(this._resolve(path), content);
    }
    read(path) {
        return this._delegate.read(this._resolve(path));
    }
    delete(path) {
        return this._delegate.delete(this._resolve(path));
    }
    rename(from, to) {
        return this._delegate.rename(this._resolve(from), this._resolve(to));
    }
    list(path) {
        return this._delegate.list(this._resolve(path));
    }
    exists(path) {
        return this._delegate.exists(this._resolve(path));
    }
    isDirectory(path) {
        return this._delegate.isDirectory(this._resolve(path));
    }
    isFile(path) {
        return this._delegate.isFile(this._resolve(path));
    }
    // Some hosts may not support stat.
    stat(path) {
        return this._delegate.stat(this._resolve(path));
    }
    // Some hosts may not support watching.
    watch(path, options) {
        return this._delegate.watch(this._resolve(path), options);
    }
}
exports.AliasHost = AliasHost;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXMuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2NvcmUvc3JjL3ZpcnR1YWwtZnMvaG9zdC9hbGlhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVFBLGtDQUEwRTtBQVcxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkNHO0FBQ0g7SUFHRSxZQUFzQixTQUF1QjtRQUF2QixjQUFTLEdBQVQsU0FBUyxDQUFjO1FBRm5DLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBYyxDQUFDO0lBRUssQ0FBQztJQUV2QyxRQUFRLENBQUMsSUFBVTtRQUMzQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxZQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsTUFBTSxTQUFTLEdBQW1CLEVBQUUsQ0FBQztRQUVyQyw0RkFBNEY7UUFDNUYsMkZBQTJGO1FBQzNGLG1DQUFtQztRQUNuQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDcEMsTUFBTSxDQUFDLEdBQUcsV0FBSSxDQUFDLHFCQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN0QyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDZixVQUFVLEdBQUcsV0FBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLENBQUM7WUFDRCw4RUFBOEU7WUFDOUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFJLENBQUMsQ0FBQyxDQUFFLHdDQUF3QztRQUMxRSxDQUFDO1FBRUQsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksT0FBTyxLQUFzQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDeEQsSUFBSSxZQUFZLEtBQXVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFFNUUsS0FBSyxDQUFDLElBQVUsRUFBRSxPQUFtQjtRQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBQ0QsSUFBSSxDQUFDLElBQVU7UUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFDRCxNQUFNLENBQUMsSUFBVTtRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFVLEVBQUUsRUFBUTtRQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELElBQUksQ0FBQyxJQUFVO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQVU7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFDRCxXQUFXLENBQUMsSUFBVTtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFDRCxNQUFNLENBQUMsSUFBVTtRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxJQUFJLENBQUMsSUFBVTtRQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELHVDQUF1QztJQUN2QyxLQUFLLENBQUMsSUFBVSxFQUFFLE9BQTBCO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVELENBQUM7Q0FDRjtBQWxFRCw4QkFrRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBOb3JtYWxpemVkUm9vdCwgUGF0aCwgUGF0aEZyYWdtZW50LCBqb2luLCBzcGxpdCB9IGZyb20gJy4uL3BhdGgnO1xuaW1wb3J0IHtcbiAgRmlsZUJ1ZmZlcixcbiAgSG9zdCxcbiAgSG9zdENhcGFiaWxpdGllcyxcbiAgSG9zdFdhdGNoRXZlbnQsXG4gIEhvc3RXYXRjaE9wdGlvbnMsXG4gIFN0YXRzLFxufSBmcm9tICcuL2ludGVyZmFjZSc7XG5cblxuLyoqXG4gKiBBIFZpcnR1YWwgSG9zdCB0aGF0IGFsbG93IHRvIGFsaWFzIHNvbWUgcGF0aHMgdG8gb3RoZXIgcGF0aHMuXG4gKlxuICogVGhpcyBkb2VzIG5vdCB2ZXJpZnksIHdoZW4gc2V0dGluZyBhbiBhbGlhcywgdGhhdCB0aGUgdGFyZ2V0IG9yIHNvdXJjZSBleGlzdC4gTmVpdGhlciBkb2VzIGl0XG4gKiBjaGVjayB3aGV0aGVyIGl0J3MgYSBmaWxlIG9yIGEgZGlyZWN0b3J5LiBQbGVhc2Ugbm90IHRoYXQgZGlyZWN0b3JpZXMgYXJlIGFsc28gcmVuYW1lZC9yZXBsYWNlZC5cbiAqXG4gKiBObyByZWN1cnNpb24gaXMgZG9uZSBvbiB0aGUgcmVzb2x1dGlvbiwgd2hpY2ggbWVhbnMgdGhlIGZvbGxvd2luZyBpcyBwZXJmZWN0bHkgdmFsaWQgdGhlbjpcbiAqXG4gKiBgYGBcbiAqICAgICBob3N0LmFsaWFzZXMuc2V0KG5vcm1hbGl6ZSgnL2ZpbGUvYScpLCBub3JtYWxpemUoJy9maWxlL2InKSk7XG4gKiAgICAgaG9zdC5hbGlhc2VzLnNldChub3JtYWxpemUoJy9maWxlL2InKSwgbm9ybWFsaXplKCcvZmlsZS9hJykpO1xuICogYGBgXG4gKlxuICogVGhpcyB3aWxsIHJlc3VsdCBpbiBhIHByb3BlciBzd2FwIG9mIHR3byBmaWxlcyBmb3IgZWFjaCBvdGhlcnMuXG4gKlxuICogQGV4YW1wbGVcbiAqICAgY29uc3QgaG9zdCA9IG5ldyBTaW1wbGVNZW1vcnlIb3N0KCk7XG4gKiAgIGhvc3Qud3JpdGUobm9ybWFsaXplKCcvc29tZS9maWxlJyksIGNvbnRlbnQpLnN1YnNjcmliZSgpO1xuICpcbiAqICAgY29uc3QgYUhvc3QgPSBuZXcgQWxpYXNIb3N0KGhvc3QpO1xuICogICBhSG9zdC5yZWFkKG5vcm1hbGl6ZSgnL3NvbWUvZmlsZScpKVxuICogICAgIC5zdWJzY3JpYmUoeCA9PiBleHBlY3QoeCkudG9CZShjb250ZW50KSk7XG4gKiAgIGFIb3N0LmFsaWFzZXMuc2V0KG5vcm1hbGl6ZSgnL3NvbWUvZmlsZScpLCBub3JtYWxpemUoJy9vdGhlci9wYXRoJyk7XG4gKlxuICogICAvLyBUaGlzIGZpbGUgd2lsbCBub3QgZXhpc3QgYmVjYXVzZSAvb3RoZXIvcGF0aCBkb2VzIG5vdCBleGlzdC5cbiAqICAgYUhvc3QucmVhZChub3JtYWxpemUoJy9zb21lL2ZpbGUnKSlcbiAqICAgICAuc3Vic2NyaWJlKHVuZGVmaW5lZCwgZXJyID0+IGV4cGVjdChlcnIubWVzc2FnZSkudG9NYXRjaCgvZG9lcyBub3QgZXhpc3QvKSk7XG4gKlxuICogQGV4YW1wbGVcbiAqICAgY29uc3QgaG9zdCA9IG5ldyBTaW1wbGVNZW1vcnlIb3N0KCk7XG4gKiAgIGhvc3Qud3JpdGUobm9ybWFsaXplKCcvc29tZS9mb2xkZXIvZmlsZScpLCBjb250ZW50KS5zdWJzY3JpYmUoKTtcbiAqXG4gKiAgIGNvbnN0IGFIb3N0ID0gbmV3IEFsaWFzSG9zdChob3N0KTtcbiAqICAgYUhvc3QucmVhZChub3JtYWxpemUoJy9zb21lL2ZvbGRlci9maWxlJykpXG4gKiAgICAgLnN1YnNjcmliZSh4ID0+IGV4cGVjdCh4KS50b0JlKGNvbnRlbnQpKTtcbiAqICAgYUhvc3QuYWxpYXNlcy5zZXQobm9ybWFsaXplKCcvc29tZScpLCBub3JtYWxpemUoJy9vdGhlcicpO1xuICpcbiAqICAgLy8gVGhpcyBmaWxlIHdpbGwgbm90IGV4aXN0IGJlY2F1c2UgL290aGVyL3BhdGggZG9lcyBub3QgZXhpc3QuXG4gKiAgIGFIb3N0LnJlYWQobm9ybWFsaXplKCcvc29tZS9mb2xkZXIvZmlsZScpKVxuICogICAgIC5zdWJzY3JpYmUodW5kZWZpbmVkLCBlcnIgPT4gZXhwZWN0KGVyci5tZXNzYWdlKS50b01hdGNoKC9kb2VzIG5vdCBleGlzdC8pKTtcbiAqXG4gKiAgIC8vIENyZWF0ZSB0aGUgZmlsZSB3aXRoIG5ldyBjb250ZW50IGFuZCB2ZXJpZnkgdGhhdCB0aGlzIGhhcyB0aGUgbmV3IGNvbnRlbnQuXG4gKiAgIGFIb3N0LndyaXRlKG5vcm1hbGl6ZSgnL290aGVyL2ZvbGRlci9maWxlJyksIGNvbnRlbnQyKS5zdWJzY3JpYmUoKTtcbiAqICAgYUhvc3QucmVhZChub3JtYWxpemUoJy9zb21lL2ZvbGRlci9maWxlJykpXG4gKiAgICAgLnN1YnNjcmliZSh4ID0+IGV4cGVjdCh4KS50b0JlKGNvbnRlbnQyKSk7XG4gKi9cbmV4cG9ydCBjbGFzcyBBbGlhc0hvc3Q8U3RhdHNUIGV4dGVuZHMgb2JqZWN0ID0ge30+IGltcGxlbWVudHMgSG9zdDxTdGF0c1Q+IHtcbiAgcHJvdGVjdGVkIF9hbGlhc2VzID0gbmV3IE1hcDxQYXRoLCBQYXRoPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZGVsZWdhdGU6IEhvc3Q8U3RhdHNUPikge31cblxuICBwcm90ZWN0ZWQgX3Jlc29sdmUocGF0aDogUGF0aCkge1xuICAgIGxldCBtYXliZUFsaWFzID0gdGhpcy5fYWxpYXNlcy5nZXQocGF0aCk7XG4gICAgY29uc3Qgc3AgPSBzcGxpdChwYXRoKTtcbiAgICBjb25zdCByZW1haW5pbmc6IFBhdGhGcmFnbWVudFtdID0gW107XG5cbiAgICAvLyBBbHNvIHJlc29sdmUgYWxsIHBhcmVudHMgb2YgdGhlIHJlcXVlc3RlZCBmaWxlcywgb25seSBwaWNraW5nIHRoZSBmaXJzdCBvbmUgdGhhdCBtYXRjaGVzLlxuICAgIC8vIFRoaXMgY2FuIGhhdmUgc3VycHJpc2luZyBiZWhhdmlvdXIgd2hlbiBhbGlhc2VzIGFyZSBpbnNpZGUgYW5vdGhlciBhbGlhcy4gSXQgd2lsbCBhbHdheXNcbiAgICAvLyB1c2UgdGhlIGNsb3Nlc3Qgb25lIHRvIHRoZSBmaWxlLlxuICAgIHdoaWxlICghbWF5YmVBbGlhcyAmJiBzcC5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBwID0gam9pbihOb3JtYWxpemVkUm9vdCwgLi4uc3ApO1xuICAgICAgbWF5YmVBbGlhcyA9IHRoaXMuX2FsaWFzZXMuZ2V0KHApO1xuXG4gICAgICBpZiAobWF5YmVBbGlhcykge1xuICAgICAgICBtYXliZUFsaWFzID0gam9pbihtYXliZUFsaWFzLCAuLi5yZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgLy8gQWxsb3cgbm9uLW51bGwtb3BlcmF0b3IgYmVjYXVzZSB3ZSBrbm93IHNwLmxlbmd0aCA+IDAgKGNvbmRpdGlvbiBvbiB3aGlsZSkuXG4gICAgICByZW1haW5pbmcudW5zaGlmdChzcC5wb3AoKSAhKTsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6bm9uLW51bGwtb3BlcmF0b3JcbiAgICB9XG5cbiAgICByZXR1cm4gbWF5YmVBbGlhcyB8fCBwYXRoO1xuICB9XG5cbiAgZ2V0IGFsaWFzZXMoKTogTWFwPFBhdGgsIFBhdGg+IHsgcmV0dXJuIHRoaXMuX2FsaWFzZXM7IH1cbiAgZ2V0IGNhcGFiaWxpdGllcygpOiBIb3N0Q2FwYWJpbGl0aWVzIHsgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLmNhcGFiaWxpdGllczsgfVxuXG4gIHdyaXRlKHBhdGg6IFBhdGgsIGNvbnRlbnQ6IEZpbGVCdWZmZXIpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUud3JpdGUodGhpcy5fcmVzb2x2ZShwYXRoKSwgY29udGVudCk7XG4gIH1cbiAgcmVhZChwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxGaWxlQnVmZmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RlbGVnYXRlLnJlYWQodGhpcy5fcmVzb2x2ZShwYXRoKSk7XG4gIH1cbiAgZGVsZXRlKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZGVsZXRlKHRoaXMuX3Jlc29sdmUocGF0aCkpO1xuICB9XG4gIHJlbmFtZShmcm9tOiBQYXRoLCB0bzogUGF0aCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5yZW5hbWUodGhpcy5fcmVzb2x2ZShmcm9tKSwgdGhpcy5fcmVzb2x2ZSh0bykpO1xuICB9XG5cbiAgbGlzdChwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxQYXRoRnJhZ21lbnRbXT4ge1xuICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5saXN0KHRoaXMuX3Jlc29sdmUocGF0aCkpO1xuICB9XG5cbiAgZXhpc3RzKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuZXhpc3RzKHRoaXMuX3Jlc29sdmUocGF0aCkpO1xuICB9XG4gIGlzRGlyZWN0b3J5KHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuaXNEaXJlY3RvcnkodGhpcy5fcmVzb2x2ZShwYXRoKSk7XG4gIH1cbiAgaXNGaWxlKHBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUuaXNGaWxlKHRoaXMuX3Jlc29sdmUocGF0aCkpO1xuICB9XG5cbiAgLy8gU29tZSBob3N0cyBtYXkgbm90IHN1cHBvcnQgc3RhdC5cbiAgc3RhdChwYXRoOiBQYXRoKTogT2JzZXJ2YWJsZTxTdGF0czxTdGF0c1Q+PiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9kZWxlZ2F0ZS5zdGF0KHRoaXMuX3Jlc29sdmUocGF0aCkpO1xuICB9XG5cbiAgLy8gU29tZSBob3N0cyBtYXkgbm90IHN1cHBvcnQgd2F0Y2hpbmcuXG4gIHdhdGNoKHBhdGg6IFBhdGgsIG9wdGlvbnM/OiBIb3N0V2F0Y2hPcHRpb25zKTogT2JzZXJ2YWJsZTxIb3N0V2F0Y2hFdmVudD4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZGVsZWdhdGUud2F0Y2godGhpcy5fcmVzb2x2ZShwYXRoKSwgb3B0aW9ucyk7XG4gIH1cbn1cbiJdfQ==