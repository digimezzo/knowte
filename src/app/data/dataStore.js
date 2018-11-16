"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var electron_log_1 = require("electron-log");
var fs = require("fs-extra");
var electron_1 = require("electron");
var path = require("path");
var constants_1 = require("../core/constants");
var lowdb = require("lowdb");
var FileAsync = require("lowdb/adapters/FileSync");
var collection_1 = require("./collection");
var DataStore = /** @class */ (function () {
    function DataStore() {
        this.dataStorePath = path.join(electron_1.app.getPath("userData"), constants_1.Constants.databaseFile);
        this.ensureDataStore();
    }
    DataStore.prototype.ensureDataStore = function () {
        var isNewDataStore = false;
        isNewDataStore = !fs.existsSync(this.dataStorePath);
        // This loads the data store (the data store file is created if it doesn't yet exist)
        var adapter = new FileAsync(this.dataStorePath);
        this.db = lowdb(adapter);
        electron_log_1.default.info("Loaded data store '" + this.dataStorePath + "'");
        // If this is a new data store file, we need to add some defaults.
        if (isNewDataStore) {
            this.db.defaults({ storageDirectory: "", collections: [], notebooks: [], notes: [] }).write();
            electron_log_1.default.info("Added defaults to data store");
        }
        var Datastore = require('nedb'), db = new Datastore({ filename: path.join(electron_1.app.getPath("userData"), "Nietleuk.db"), autoload: true });
        var doc = {
            hello: 'world',
            n: 5,
            today: new Date(),
            nedbIsAwesome: true,
            notthere: null,
            notToBeSaved: undefined,
            fruits: ['apple', 'orange', 'pear'],
            infos: { name: 'nedb' }
        };
        db.insert(doc, function (err, newDoc) { });
    };
    DataStore.prototype.deleteDataStore = function () {
        if (fs.existsSync(this.dataStorePath)) {
            fs.unlinkSync(this.dataStorePath);
            electron_log_1.default.info("Deleted database file '" + this.dataStorePath + "'");
        }
    };
    DataStore.prototype.clearDataStore = function () {
        this.db.get('collections').remove().write();
        this.db.get('notebooks').remove().write();
        this.db.get('notes').remove().write();
    };
    DataStore.prototype.getStorageDirectory = function () {
        return this.db.get('storageDirectory').value();
    };
    DataStore.prototype.setStorageDirectory = function (storageDirectory) {
        this.db.set('storageDirectory', storageDirectory).write();
    };
    DataStore.prototype.addCollection = function (collectionName, isActive) {
        var newCollection = new collection_1.Collection(collectionName, isActive);
        this.db.get('collections').push(newCollection).write();
    };
    DataStore.prototype.getAllCollections = function () {
        return this.db.get('collections').value();
    };
    DataStore.prototype.getCollectionsByName = function (collectionName) {
        var nameLower = collectionName.toLowerCase();
        return this.db.get('collections').filter({ nameLower: nameLower }).value();
    };
    DataStore.prototype.getCollection = function (collectionId) {
        return this.db.get('collections').find({ id: collectionId }).value();
    };
    DataStore.prototype.activateCollection = function (collectionId) {
        this.db.get('collections').each(function (coll) { return coll.isActive = 0; }).write();
        var collectionRef = this.db.get('collections').find({ id: collectionId });
        collectionRef.assign({ isActive: 1 }).write();
        return collectionRef.value().name;
    };
    DataStore.prototype.setCollectionName = function (collectionId, collectionName) {
        this.db.get('collections').find({ id: collectionId }).assign({ name: collectionName }).write();
    };
    DataStore.prototype.deleteCollection = function (collectionId) {
        this.db.get('collections').remove({ id: collectionId }).write();
        this.db.get('notebooks').remove({ collectionId: collectionId }).write();
        this.db.get('notes').remove({ collectionId: collectionId }).write();
    };
    DataStore = __decorate([
        core_1.Injectable({
            providedIn: 'root',
        }),
        __metadata("design:paramtypes", [])
    ], DataStore);
    return DataStore;
}());
exports.DataStore = DataStore;
//# sourceMappingURL=dataStore.js.map