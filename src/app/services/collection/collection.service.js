"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../../core/constants");
var path = require("path");
var fs = require("fs-extra");
var electron_log_1 = require("electron-log");
var Store = require("electron-store");
var rxjs_1 = require("rxjs");
var collectionOperation_1 = require("./collectionOperation");
var utils_1 = require("../../core/utils");
var notebook_1 = require("../data/notebook");
var notebookOperation_1 = require("./notebookOperation");
var noteOperation_1 = require("./noteOperation");
var addNoteResult_1 = require("./addNoteResult");
var moment = require("moment");
var noteDateFormatResult_1 = require("./noteDateFormatResult");
var noteCountersArgs_1 = require("./noteCountersArgs");
var noteMarkChangedArgs_1 = require("./noteMarkChangedArgs");
var noteRenamedArgs_1 = require("./noteRenamedArgs");
var dataStore_1 = require("../../data/dataStore");
var CollectionService = /** @class */ (function () {
    function CollectionService() {
        this.openNoteIds = [];
        this.dataStore = new dataStore_1.DataStore();
        this.settings = new Store();
        this.dataStoreInitialized = new rxjs_1.Subject();
        this.dataStoreInitialized$ = this.dataStoreInitialized.asObservable();
        this.collectionsChanged = new rxjs_1.Subject();
        this.collectionsChanged$ = this.collectionsChanged.asObservable();
        this.collectionActivated = new rxjs_1.Subject();
        this.collectionActivated$ = this.collectionActivated.asObservable();
        this.collectionAdded = new rxjs_1.Subject();
        this.collectionAdded$ = this.collectionAdded.asObservable();
        this.collectionRenamed = new rxjs_1.Subject();
        this.collectionRenamed$ = this.collectionRenamed.asObservable();
        this.collectionDeleted = new rxjs_1.Subject();
        this.collectionDeleted$ = this.collectionDeleted.asObservable();
        this.notebookAdded = new rxjs_1.Subject();
        this.notebookAdded$ = this.notebookAdded.asObservable();
        this.notebookRenamed = new rxjs_1.Subject();
        this.notebookRenamed$ = this.notebookRenamed.asObservable();
        this.notebookDeleted = new rxjs_1.Subject();
        this.notebookDeleted$ = this.notebookDeleted.asObservable();
        this.noteAdded = new rxjs_1.Subject();
        this.noteAdded$ = this.noteAdded.asObservable();
        this.noteDeleted = new rxjs_1.Subject();
        this.noteDeleted$ = this.noteDeleted.asObservable();
        this.noteMarkChanged = new rxjs_1.Subject();
        this.noteMarkChanged$ = this.noteMarkChanged.asObservable();
        this.noteCountersChanged = new rxjs_1.Subject();
        this.noteCountersChanged$ = this.noteCountersChanged.asObservable();
        this.noteRenamed = new rxjs_1.Subject();
        this.noteRenamed$ = this.noteRenamed.asObservable();
        electron_log_1.default.info("CollectionService");
    }
    Object.defineProperty(CollectionService.prototype, "hasDataStore", {
        get: function () {
            return this.dataStore.isReady;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectionService.prototype, "hasStorageDirectory", {
        get: function () {
            // 1. Get the storage directory from the data store
            var storageDirectory = this.settings.get('storageDirectory');
            if (!storageDirectory) {
                // Storage directory is empty
                electron_log_1.default.info("Storage directory setting is empty");
                return false;
            }
            // 2. If a storage directory was found in the data store, check if it exists on disk.
            if (!fs.existsSync(storageDirectory)) {
                // Storage directory is not found on disk
                electron_log_1.default.info("Storage directory '" + storageDirectory + "' is not found on disk");
                return false;
            }
            // Storage directory is OK.
            electron_log_1.default.info("Storage directory '" + storageDirectory + "' is OK");
            return true;
        },
        enumerable: true,
        configurable: true
    });
    CollectionService.prototype.initializeStorageDirectoryAsync = function (parentDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            var storageDirectory, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        storageDirectory = path.join(parentDirectory, constants_1.Constants.collectionsDirectory);
                        return [4 /*yield*/, fs.exists(storageDirectory)];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, fs.mkdir(storageDirectory)];
                    case 2:
                        _a.sent();
                        electron_log_1.default.info("Created storageDirectory '" + storageDirectory + "' on disk");
                        return [3 /*break*/, 4];
                    case 3:
                        electron_log_1.default.info("StorageDirectory '" + storageDirectory + "' already exists on disk. No need to create it.");
                        _a.label = 4;
                    case 4:
                        // Save storage directory in the settings store
                        this.settings.set('storageDirectory', storageDirectory);
                        electron_log_1.default.info("Saved storage directory '" + storageDirectory + "' in settings store");
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        electron_log_1.default.error("Could not create storage directory on disk. Cause: " + error_1);
                        return [2 /*return*/, false];
                    case 6: 
                    //await Utils.sleep(2000);
                    return [2 /*return*/, true];
                }
            });
        });
    };
    CollectionService.prototype.initializeDataStoreAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storageDirectory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        storageDirectory = this.settings.get('storageDirectory');
                        // We can only initialize the data store if a storage directory was
                        // found in the settings, AND the storage directory exists on disk.
                        if (!storageDirectory || !fs.existsSync(storageDirectory)) {
                            return [2 /*return*/];
                        }
                        if (!!this.dataStore.isReady) return [3 /*break*/, 3];
                        this.dataStore.initialize(storageDirectory);
                        _a.label = 1;
                    case 1:
                        if (!!this.dataStore.isReady) return [3 /*break*/, 3];
                        return [4 /*yield*/, utils_1.Utils.sleep(100)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        //await Utils.sleep(2000);
                        this.dataStoreInitialized.next();
                        return [2 /*return*/];
                }
            });
        });
    };
    CollectionService.prototype.collectionExists = function (collectionName) {
        var collection = this.dataStore.getCollectionByName(collectionName);
        return collection != null;
    };
    CollectionService.prototype.addCollection = function (collectionName) {
        // Check if a collection name was provided
        if (!collectionName) {
            electron_log_1.default.error("collectionName is null");
            return collectionOperation_1.CollectionOperation.Error;
        }
        // Check if there is already a collection with that name
        if (this.collectionExists(collectionName)) {
            electron_log_1.default.info("Not adding collection '" + collectionName + "' to the data store because it already exists");
            return collectionOperation_1.CollectionOperation.Duplicate;
        }
        try {
            // Add the collection to the data store
            this.dataStore.addCollection(collectionName, false);
            electron_log_1.default.info("Added collection '" + collectionName + "' to the data store");
        }
        catch (error) {
            electron_log_1.default.error("Could not add collection '" + collectionName + "'. Cause: " + error);
            return collectionOperation_1.CollectionOperation.Error;
        }
        this.collectionAdded.next(collectionName);
        return collectionOperation_1.CollectionOperation.Success;
    };
    CollectionService.prototype.renameCollectionAsync = function (collectionId, newCollectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!collectionId || !newCollectionName) {
                    electron_log_1.default.error("renameCollectionAsync: collectionId or newCollectionName is null");
                    return [2 /*return*/, collectionOperation_1.CollectionOperation.Error];
                }
                try {
                    // 1. Check if there is already a collection with that name
                    if (this.collectionExists(newCollectionName)) {
                        return [2 /*return*/, collectionOperation_1.CollectionOperation.Duplicate];
                    }
                    // 2. Rename the collection
                    this.dataStore.setCollectionName(collectionId, newCollectionName);
                }
                catch (error) {
                    electron_log_1.default.error("Could not rename the collection with id='" + collectionId + "' to '" + newCollectionName + "'. Cause: " + error);
                    return [2 /*return*/, collectionOperation_1.CollectionOperation.Error];
                }
                this.collectionRenamed.next(newCollectionName);
                return [2 /*return*/, collectionOperation_1.CollectionOperation.Success];
            });
        });
    };
    CollectionService.prototype.getCollections = function () {
        var collections;
        try {
            collections = this.dataStore.getAllCollections();
        }
        catch (error) {
            electron_log_1.default.error("Could not get collections. Cause: " + error);
            // This is a fatal error. Throw the error so the global error handler catches it.
            throw error;
        }
        return collections;
    };
    CollectionService.prototype.getCollectionName = function (collectionId) {
        return this.dataStore.getCollection(collectionId).name;
    };
    CollectionService.prototype.activateCollection = function (collectionId) {
        this.dataStore.activateCollection(collectionId);
        var activeCollection = this.dataStore.getActiveCollection();
        this.collectionActivated.next(activeCollection.name);
    };
    CollectionService.prototype.deleteCollectionAsync = function (collectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionName;
            return __generator(this, function (_a) {
                if (!collectionId) {
                    electron_log_1.default.error("deleteCollectionAsync: collectionId is null");
                    return [2 /*return*/, collectionOperation_1.CollectionOperation.Error];
                }
                collectionName = "";
                try {
                    // 1. Get the name of the collection
                    collectionName = this.getCollectionName(collectionId);
                    // 2. Delete collection from data store (including its notebooks and notes)
                    this.dataStore.deleteCollection(collectionId);
                    // 2. Delete the note files from disk
                    // TODO
                }
                catch (error) {
                    electron_log_1.default.error("Could not delete the collection with id='" + collectionId + "'. Cause: " + error);
                    return [2 /*return*/, collectionOperation_1.CollectionOperation.Error];
                }
                this.collectionDeleted.next(collectionName);
                return [2 /*return*/, collectionOperation_1.CollectionOperation.Success];
            });
        });
    };
    CollectionService.prototype.getNotebooksAsync = function (translateService) {
        return __awaiter(this, void 0, void 0, function () {
            var notebooks, activeCollection, activeCollectionId, allNotesNotebook, _a, unfiledNotesNotebook, _b, userNotebooks, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        notebooks = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        activeCollection = this.dataStore.getActiveCollection();
                        if (!activeCollection) {
                            return [2 /*return*/, notebooks];
                        }
                        activeCollectionId = activeCollection.id;
                        _a = notebook_1.Notebook.bind;
                        return [4 /*yield*/, translateService.get('MainPage.AllNotes').toPromise()];
                    case 2:
                        allNotesNotebook = new (_a.apply(notebook_1.Notebook, [void 0, _c.sent(), activeCollectionId]))();
                        allNotesNotebook.id = constants_1.Constants.allNotesNotebookId;
                        allNotesNotebook.isDefault = true;
                        _b = notebook_1.Notebook.bind;
                        return [4 /*yield*/, translateService.get('MainPage.UnfiledNotes').toPromise()];
                    case 3:
                        unfiledNotesNotebook = new (_b.apply(notebook_1.Notebook, [void 0, _c.sent(), activeCollectionId]))();
                        unfiledNotesNotebook.id = constants_1.Constants.unfiledNotesNotebookId;
                        unfiledNotesNotebook.isDefault = true;
                        notebooks.push(allNotesNotebook);
                        notebooks.push(unfiledNotesNotebook);
                        userNotebooks = this.dataStore.getNotebooks(activeCollectionId);
                        // 5. Add the user defined notebooks to the notebooks
                        notebooks.push.apply(notebooks, userNotebooks);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _c.sent();
                        electron_log_1.default.error("Could not get notebooks. Cause: " + error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, notebooks];
                }
            });
        });
    };
    CollectionService.prototype.notebookExists = function (notebookName) {
        var activeCollection = this.dataStore.getActiveCollection();
        var notebook = this.dataStore.getNotebookByName(activeCollection.id, notebookName);
        return notebook != null;
    };
    CollectionService.prototype.addNotebook = function (notebookName) {
        // Check if a notebook name was provided
        if (!notebookName) {
            electron_log_1.default.error("notebookName is null");
            return notebookOperation_1.NotebookOperation.Error;
        }
        // Check if there is already a notebook with that name
        if (this.notebookExists(notebookName)) {
            electron_log_1.default.info("Not adding notebook '" + notebookName + "' to the data store because it already exists");
            return notebookOperation_1.NotebookOperation.Duplicate;
        }
        try {
            // Add the notebook to the data store
            var activeCollection = this.dataStore.getActiveCollection();
            this.dataStore.addNotebook(activeCollection.id, notebookName);
            electron_log_1.default.info("Added notebook '" + notebookName + "' to the data store");
        }
        catch (error) {
            electron_log_1.default.error("Could not add notebook '" + notebookName + "'. Cause: " + error);
            return notebookOperation_1.NotebookOperation.Error;
        }
        this.notebookAdded.next(notebookName);
        return notebookOperation_1.NotebookOperation.Success;
    };
    CollectionService.prototype.renameNotebookAsync = function (notebookId, newNotebookName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!notebookId || !newNotebookName) {
                    electron_log_1.default.error("renameNotebookAsync: notebookId or newNotebookName is null");
                    return [2 /*return*/, notebookOperation_1.NotebookOperation.Error];
                }
                try {
                    // 1. Check if there is already a notebook with that name
                    if (this.notebookExists(newNotebookName)) {
                        return [2 /*return*/, notebookOperation_1.NotebookOperation.Duplicate];
                    }
                    // 2. Rename the notebook
                    this.dataStore.setNotebookName(notebookId, newNotebookName);
                }
                catch (error) {
                    electron_log_1.default.error("Could not rename the notebook with id='" + notebookId + "' to '" + newNotebookName + "'. Cause: " + error);
                    return [2 /*return*/, notebookOperation_1.NotebookOperation.Error];
                }
                this.notebookRenamed.next(newNotebookName);
                return [2 /*return*/, notebookOperation_1.NotebookOperation.Success];
            });
        });
    };
    CollectionService.prototype.getNotebookName = function (notebookId) {
        return this.dataStore.getNotebook(notebookId).name;
    };
    CollectionService.prototype.deleteNotebookAsync = function (notebookId) {
        return __awaiter(this, void 0, void 0, function () {
            var notebookName;
            return __generator(this, function (_a) {
                if (!notebookId) {
                    electron_log_1.default.error("deleteNotebookAsync: notebookId is null");
                    return [2 /*return*/, notebookOperation_1.NotebookOperation.Error];
                }
                notebookName = "";
                try {
                    // 1. Get the name of the notebook
                    notebookName = this.getNotebookName(notebookId);
                    // 2. Delete notebook from data store
                    this.dataStore.deleteNotebook(notebookId);
                }
                catch (error) {
                    electron_log_1.default.error("Could not delete the notebook with id='" + notebookId + "'. Cause: " + error);
                    return [2 /*return*/, notebookOperation_1.NotebookOperation.Error];
                }
                this.notebookDeleted.next(notebookName);
                return [2 /*return*/, notebookOperation_1.NotebookOperation.Success];
            });
        });
    };
    CollectionService.prototype.deleteNoteAsync = function (noteId) {
        return __awaiter(this, void 0, void 0, function () {
            var noteTitle, noteToDelete;
            return __generator(this, function (_a) {
                if (!noteId) {
                    electron_log_1.default.error("deleteNoteAsync: noteId is null");
                    return [2 /*return*/, noteOperation_1.NoteOperation.Error];
                }
                noteTitle = "";
                try {
                    noteToDelete = this.dataStore.getNote(noteId);
                    // 1. Get the title of the note
                    noteTitle = noteToDelete.title;
                    // 2. Delete note from data store
                    this.dataStore.deleteNote(noteId);
                    // 3. Delete all files from disk, which are related to the note.
                    // TODO
                }
                catch (error) {
                    electron_log_1.default.error("Could not delete the note with id='" + noteId + "'. Cause: " + error);
                    return [2 /*return*/, noteOperation_1.NoteOperation.Error];
                }
                this.noteDeleted.next(noteTitle);
                return [2 /*return*/, noteOperation_1.NoteOperation.Success];
            });
        });
    };
    CollectionService.prototype.getNoteDateFormatResultAsync = function (millisecondsSinceEpoch, useFuzzyDates, translateService) {
        return __awaiter(this, void 0, void 0, function () {
            var result, nowDateonly, modificationDateOnly, duration, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, m, dateText;
            return __generator(this, function (_z) {
                switch (_z.label) {
                    case 0:
                        result = new noteDateFormatResult_1.NoteDateFormatResult();
                        nowDateonly = moment().startOf('day');
                        modificationDateOnly = moment(millisecondsSinceEpoch).startOf('day');
                        duration = moment.duration(nowDateonly.diff(modificationDateOnly));
                        if (!(duration.asMonths() >= 12)) return [3 /*break*/, 2];
                        _a = result;
                        return [4 /*yield*/, translateService.get('NoteDates.LongAgo').toPromise()];
                    case 1:
                        _a.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 2:
                        if (!(duration.asMonths() >= 11)) return [3 /*break*/, 4];
                        _b = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 11 }).toPromise()];
                    case 3:
                        _b.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 4:
                        if (!(duration.asMonths() >= 10)) return [3 /*break*/, 6];
                        _c = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 10 }).toPromise()];
                    case 5:
                        _c.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 6:
                        if (!(duration.asMonths() >= 9)) return [3 /*break*/, 8];
                        _d = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 9 }).toPromise()];
                    case 7:
                        _d.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 8:
                        if (!(duration.asMonths() >= 8)) return [3 /*break*/, 10];
                        _e = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 8 }).toPromise()];
                    case 9:
                        _e.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 10:
                        if (!(duration.asMonths() >= 7)) return [3 /*break*/, 12];
                        _f = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 7 }).toPromise()];
                    case 11:
                        _f.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 12:
                        if (!(duration.asMonths() >= 6)) return [3 /*break*/, 14];
                        _g = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 6 }).toPromise()];
                    case 13:
                        _g.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 14:
                        if (!(duration.asMonths() >= 5)) return [3 /*break*/, 16];
                        _h = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 5 }).toPromise()];
                    case 15:
                        _h.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 16:
                        if (!(duration.asMonths() >= 4)) return [3 /*break*/, 18];
                        _j = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 4 }).toPromise()];
                    case 17:
                        _j.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 18:
                        if (!(duration.asMonths() >= 3)) return [3 /*break*/, 20];
                        _k = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 3 }).toPromise()];
                    case 19:
                        _k.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 20:
                        if (!(duration.asMonths() >= 2)) return [3 /*break*/, 22];
                        _l = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 2 }).toPromise()];
                    case 21:
                        _l.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 22:
                        if (!(duration.asMonths() >= 1)) return [3 /*break*/, 24];
                        _m = result;
                        return [4 /*yield*/, translateService.get('NoteDates.MonthsAgo', { count: 1 }).toPromise()];
                    case 23:
                        _m.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 24:
                        if (!(duration.asDays() >= 21)) return [3 /*break*/, 26];
                        _o = result;
                        return [4 /*yield*/, translateService.get('NoteDates.WeeksAgo', { count: 3 }).toPromise()];
                    case 25:
                        _o.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 26:
                        if (!(duration.asDays() >= 14)) return [3 /*break*/, 28];
                        _p = result;
                        return [4 /*yield*/, translateService.get('NoteDates.WeeksAgo', { count: 2 }).toPromise()];
                    case 27:
                        _p.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 28:
                        if (!(duration.asDays() >= 8)) return [3 /*break*/, 30];
                        _q = result;
                        return [4 /*yield*/, translateService.get('NoteDates.LastWeek').toPromise()];
                    case 29:
                        _q.dateText = _z.sent();
                        return [3 /*break*/, 46];
                    case 30:
                        if (!(duration.asDays() >= 7)) return [3 /*break*/, 32];
                        _r = result;
                        return [4 /*yield*/, translateService.get('NoteDates.DaysAgo', { count: 7 }).toPromise()];
                    case 31:
                        _r.dateText = _z.sent();
                        result.isThisWeekNote = true;
                        return [3 /*break*/, 46];
                    case 32:
                        if (!(duration.asDays() >= 6)) return [3 /*break*/, 34];
                        _s = result;
                        return [4 /*yield*/, translateService.get('NoteDates.DaysAgo', { count: 6 }).toPromise()];
                    case 33:
                        _s.dateText = _z.sent();
                        result.isThisWeekNote = true;
                        return [3 /*break*/, 46];
                    case 34:
                        if (!(duration.asDays() >= 5)) return [3 /*break*/, 36];
                        _t = result;
                        return [4 /*yield*/, translateService.get('NoteDates.DaysAgo', { count: 5 }).toPromise()];
                    case 35:
                        _t.dateText = _z.sent();
                        result.isThisWeekNote = true;
                        return [3 /*break*/, 46];
                    case 36:
                        if (!(duration.asDays() >= 4)) return [3 /*break*/, 38];
                        _u = result;
                        return [4 /*yield*/, translateService.get('NoteDates.DaysAgo', { count: 4 }).toPromise()];
                    case 37:
                        _u.dateText = _z.sent();
                        result.isThisWeekNote = true;
                        return [3 /*break*/, 46];
                    case 38:
                        if (!(duration.asDays() >= 3)) return [3 /*break*/, 40];
                        _v = result;
                        return [4 /*yield*/, translateService.get('NoteDates.DaysAgo', { count: 3 }).toPromise()];
                    case 39:
                        _v.dateText = _z.sent();
                        result.isThisWeekNote = true;
                        return [3 /*break*/, 46];
                    case 40:
                        if (!(duration.asDays() >= 2)) return [3 /*break*/, 42];
                        _w = result;
                        return [4 /*yield*/, translateService.get('NoteDates.DaysAgo', { count: 2 }).toPromise()];
                    case 41:
                        _w.dateText = _z.sent();
                        result.isThisWeekNote = true;
                        return [3 /*break*/, 46];
                    case 42:
                        if (!(duration.asDays() >= 1)) return [3 /*break*/, 44];
                        _x = result;
                        return [4 /*yield*/, translateService.get('NoteDates.Yesterday').toPromise()];
                    case 43:
                        _x.dateText = _z.sent();
                        result.isYesterdayNote = true;
                        result.isThisWeekNote = true;
                        return [3 /*break*/, 46];
                    case 44:
                        if (!(duration.asDays() >= 0)) return [3 /*break*/, 46];
                        _y = result;
                        return [4 /*yield*/, translateService.get('NoteDates.Today').toPromise()];
                    case 45:
                        _y.dateText = _z.sent();
                        result.isTodayNote = true;
                        result.isThisWeekNote = true;
                        _z.label = 46;
                    case 46:
                        if (!useFuzzyDates) {
                            m = moment(millisecondsSinceEpoch);
                            dateText = m.format("MMMM D, YYYY HH:mm");
                            result.dateText = dateText;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    CollectionService.prototype.getNotesAsync = function (notebookId, useFuzzyDates, translateService) {
        return __awaiter(this, void 0, void 0, function () {
            var notes, arg, activeCollection, _i, notes_1, note, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        notes = [];
                        arg = new noteCountersArgs_1.NoteCountersArgs();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        activeCollection = this.dataStore.getActiveCollection();
                        if (notebookId === constants_1.Constants.allNotesNotebookId) {
                            notes = this.dataStore.getAllNotes(activeCollection.id);
                        }
                        else if (notebookId === constants_1.Constants.unfiledNotesNotebookId) {
                            notes = this.dataStore.getUnfiledNotes(activeCollection.id);
                        }
                        else {
                            notes = this.dataStore.getNotes(notebookId);
                        }
                        // Fill in counters
                        arg.allNotesCount = notes.length;
                        arg.markedNotesCount = notes.filter(function (x) { return x.isMarked; }).length;
                        _i = 0, notes_1 = notes;
                        _a.label = 2;
                    case 2:
                        if (!(_i < notes_1.length)) return [3 /*break*/, 5];
                        note = notes_1[_i];
                        return [4 /*yield*/, this.getNoteDateFormatResultAsync(note.modificationDate, useFuzzyDates, translateService)];
                    case 3:
                        result = _a.sent();
                        // More counters
                        if (result.isTodayNote) {
                            arg.todayNotesCount++;
                        }
                        if (result.isYesterdayNote) {
                            arg.yesterdayNotesCount++;
                        }
                        if (result.isThisWeekNote) {
                            arg.thisWeekNotesCount++;
                        }
                        // Date text
                        note.displayModificationDate = result.dateText;
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.noteCountersChanged.next(arg);
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        electron_log_1.default.error("Could not get notes. Cause: " + error_3);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, notes];
                }
            });
        });
    };
    CollectionService.prototype.getSimilarTitles = function (baseTitle) {
        var notesWithIdenticalBaseTitle = this.dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
        return notesWithIdenticalBaseTitle.map(function (x) { return x.title; });
    };
    CollectionService.prototype.getUniqueNoteTitle = function (baseTitle) {
        var similarTitles = [];
        var counter = 1;
        var uniqueTitle = baseTitle + " " + counter;
        similarTitles = this.getSimilarTitles(baseTitle);
        while (similarTitles.includes(uniqueTitle)) {
            counter++;
            uniqueTitle = baseTitle + " " + counter;
        }
        return uniqueTitle;
    };
    CollectionService.prototype.addNote = function (baseTitle, notebookId) {
        var uniqueTitle = "";
        var addNoteResult = new addNoteResult_1.AddNoteResult();
        // If a default notebook was selected, make sure the note is added as unfiled.
        if (notebookId === constants_1.Constants.allNotesNotebookId || notebookId === constants_1.Constants.unfiledNotesNotebookId) {
            notebookId = "";
        }
        try {
            uniqueTitle = this.getUniqueNoteTitle(baseTitle);
            var activeCollection = this.dataStore.getActiveCollection();
            addNoteResult.noteId = this.dataStore.addNote(uniqueTitle, notebookId, activeCollection.id);
            addNoteResult.noteTitle = uniqueTitle;
            this.noteAdded.next(uniqueTitle);
        }
        catch (error) {
            electron_log_1.default.error("Could not add note '" + uniqueTitle + "'. Cause: " + error);
            addNoteResult.operation = noteOperation_1.NoteOperation.Error;
        }
        return addNoteResult;
    };
    CollectionService.prototype.getNote = function (noteId) {
        return this.dataStore.getNote(noteId);
    };
    CollectionService.prototype.setNoteMark = function (noteId, isMarked) {
        this.dataStore.setNoteMark(noteId, isMarked);
        var activeCollection = this.dataStore.getActiveCollection();
        var markedNotes = this.dataStore.getMarkedNotes(activeCollection.id);
        var arg = new noteMarkChangedArgs_1.NoteMarkChangedArgs(noteId, isMarked, markedNotes.length);
        this.noteMarkChanged.next(arg);
    };
    CollectionService.prototype.noteExists = function (noteTitle) {
        var activeCollection = this.dataStore.getActiveCollection();
        var note = this.dataStore.getNoteByTitle(activeCollection.id, noteTitle);
        return note != null;
    };
    CollectionService.prototype.renameNote = function (noteId, newNoteTitle) {
        if (!noteId || !newNoteTitle) {
            electron_log_1.default.error("renameNote: noteId or newNoteTitle is null");
            return noteOperation_1.NoteOperation.Error;
        }
        try {
            // 1. Check if there is already a note with that title
            if (this.noteExists(newNoteTitle)) {
                return noteOperation_1.NoteOperation.Duplicate;
            }
            // 2. Rename the note
            this.dataStore.setNoteTitle(noteId, newNoteTitle);
        }
        catch (error) {
            electron_log_1.default.error("Could not rename the note with id='" + noteId + "' to '" + newNoteTitle + "'. Cause: " + error);
            return noteOperation_1.NoteOperation.Error;
        }
        var args = new noteRenamedArgs_1.NoteRenamedArgs(noteId, newNoteTitle);
        this.noteRenamed.next(args);
        return noteOperation_1.NoteOperation.Success;
    };
    CollectionService.prototype.updateNote = function (note) {
        try {
            this.dataStore.updateNote(note);
        }
        catch (error) {
            electron_log_1.default.error("Could not update the note with id='" + note.id + "' to '" + note.title + "'. Cause: " + error);
            return noteOperation_1.NoteOperation.Error;
        }
        return noteOperation_1.NoteOperation.Success;
    };
    CollectionService.prototype.openNote = function (noteId) {
        if (!this.openNoteIds.includes(noteId)) {
            this.openNoteIds.push(noteId);
        }
    };
    CollectionService.prototype.closeNote = function (noteId) {
        if (this.openNoteIds.includes(noteId)) {
            this.openNoteIds.splice(this.openNoteIds.indexOf(noteId), 1);
        }
    };
    CollectionService.prototype.noteIsOpen = function (noteId) {
        return this.openNoteIds.includes(noteId);
    };
    return CollectionService;
}());
exports.CollectionService = CollectionService;
//# sourceMappingURL=collection.service.js.map