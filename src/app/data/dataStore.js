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
var Store = require("electron-store");
var loki = require("lokijs");
var notebook_1 = require("./entities/notebook");
var note_1 = require("./entities/note");
var moment = require("moment");
var utils_1 = require("../core/utils");
var DataStore = /** @class */ (function () {
    function DataStore() {
        this.settings = new Store();
        this.isLoaded = false;
    }
    DataStore.prototype.databaseLoaded = function () {
        var mustSaveDatabase = false;
        this.notebooks = this.db.getCollection('notebooks');
        if (!this.notebooks) {
            this.notebooks = this.db.addCollection('notebooks');
            mustSaveDatabase = true;
        }
        this.notes = this.db.getCollection('notes');
        if (!this.notes) {
            this.notes = this.db.addCollection('notes');
            mustSaveDatabase = true;
        }
        if (mustSaveDatabase) {
            this.db.saveDatabase();
        }
        this.isLoaded = true;
    };
    DataStore.prototype.loadDatabase = function (databaseFile) {
        this.isLoaded = false;
        this.databaseFile = databaseFile;
        this.db = new loki(databaseFile, {
            autoload: true,
            autoloadCallback: this.databaseLoaded.bind(this)
        });
    };
    DataStore.prototype.initializeAsync = function (databaseFile) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.databaseFile && this.databaseFile === databaseFile && this.isLoaded) {
                            // This database file is already loaded
                            return [2 /*return*/];
                        }
                        this.loadDatabase(databaseFile);
                        _a.label = 1;
                    case 1:
                        if (!!this.isLoaded) return [3 /*break*/, 3];
                        return [4 /*yield*/, utils_1.Utils.sleep(100)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DataStore.prototype.getNotebooks = function () {
        var notebooks = this.notebooks.chain().sort(utils_1.Utils.caseInsensitiveNameSort).data();
        return notebooks;
    };
    DataStore.prototype.getNotebookById = function (id) {
        return this.notebooks.findOne({ 'id': id });
    };
    DataStore.prototype.getNotebookByName = function (name) {
        return this.notebooks.findOne({ 'name': name });
    };
    DataStore.prototype.addNotebook = function (name) {
        var newNotebook = new notebook_1.Notebook(name);
        this.notebooks.insert(newNotebook);
        this.db.saveDatabase();
        return newNotebook.id;
    };
    DataStore.prototype.deleteNotebook = function (id) {
        var notebookToDelete = this.getNotebookById(id);
        this.notebooks.remove(notebookToDelete);
        this.db.saveDatabase();
    };
    DataStore.prototype.getNotes = function () {
        var notes = this.notes.chain().simplesort('modificationDate', true).data();
        return notes;
    };
    DataStore.prototype.getUnfiledNotes = function () {
        var notebookIds = this.notebooks.chain().data().map(function (x) { return x.id; });
        var notes = this.notes.chain().where(function (obj) {
            return obj.notebookId === "" || !notebookIds.includes(obj.notebookId);
        }).simplesort('modificationDate', true).data();
        return notes;
    };
    DataStore.prototype.getMarkedNotes = function () {
        var notes = this.notes.chain().find({ 'isMarked': true }).simplesort('modificationDate', true).data();
        return notes;
    };
    DataStore.prototype.getNotebookNotes = function (notebookId) {
        var notes = this.notes.chain().find({ 'notebookId': notebookId }).simplesort('modificationDate', true).data();
        return notes;
    };
    DataStore.prototype.getNotesWithIdenticalBaseTitle = function (baseTitle) {
        var notesWithIdenticalBaseTitle = this.notes.chain().where(function (obj) {
            return obj.title.startsWith(baseTitle);
        }).data();
        return notesWithIdenticalBaseTitle;
    };
    DataStore.prototype.addNote = function (title, notebookId) {
        var newNote = new note_1.Note(title, notebookId);
        this.notes.insert(newNote);
        this.db.saveDatabase();
        return newNote.id;
    };
    DataStore.prototype.getNoteById = function (id) {
        var note = this.notes.findOne({ 'id': id });
        return note;
    };
    DataStore.prototype.getNoteByTitle = function (noteTitle) {
        return this.notes.findOne({ 'title': noteTitle });
    };
    DataStore.prototype.deleteNote = function (id) {
        var noteToDelete = this.getNoteById(id);
        this.notes.remove(noteToDelete);
        this.db.saveDatabase();
    };
    DataStore.prototype.updateNote = function (note) {
        this.notes.update(note);
        note.modificationDate = moment().valueOf();
        this.db.saveDatabase();
    };
    DataStore.prototype.updateNotebook = function (notebook) {
        this.notebooks.update(notebook);
        this.db.saveDatabase();
    };
    DataStore.prototype.getOpenNotes = function () {
        var notes = this.notes.chain().find({ 'isOpen': true }).data();
        return notes;
    };
    DataStore.prototype.closeAllNotes = function () {
        var openNotes = this.notes.chain().find({ 'isOpen': true }).data();
        for (var _i = 0, openNotes_1 = openNotes; _i < openNotes_1.length; _i++) {
            var openNote = openNotes_1[_i];
            openNote.isOpen = false;
            this.notes.update(openNote);
        }
        this.db.saveDatabase();
    };
    return DataStore;
}());
exports.DataStore = DataStore;
//# sourceMappingURL=dataStore.js.map