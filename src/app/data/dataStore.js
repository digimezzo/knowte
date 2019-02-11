"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Store = require("electron-store");
var loki = require("lokijs");
var path = require("path");
var constants_1 = require("../core/constants");
var collection_1 = require("./entities/collection");
var notebook_1 = require("./entities/notebook");
var note_1 = require("./entities/note");
var moment = require("moment");
var utils_1 = require("../core/utils");
var DataStore = /** @class */ (function () {
    function DataStore() {
        this.settings = new Store();
        this.isReady = false;
    }
    DataStore.prototype.databaseLoaded = function () {
        var mustSaveDatabase = false;
        this.collections = this.db.getCollection('collections');
        if (!this.collections) {
            this.collections = this.db.addCollection('collections');
            this.collections.insert(new collection_1.Collection(constants_1.Constants.defaultCollectionName, true));
            mustSaveDatabase = true;
        }
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
        this.isReady = true;
    };
    DataStore.prototype.initialize = function (storageDirectory) {
        this.db = new loki(path.join(storageDirectory, constants_1.Constants.dataStoreFile), {
            autoload: true,
            autoloadCallback: this.databaseLoaded.bind(this)
        });
    };
    DataStore.prototype.getCollections = function () {
        return this.collections.chain().sort(utils_1.Utils.caseInsensitiveNameSort).data();
    };
    DataStore.prototype.getCollectionById = function (id) {
        return this.collections.findOne({ 'id': id });
    };
    DataStore.prototype.getCollectionByName = function (name) {
        return this.collections.findOne({ 'name': name });
    };
    DataStore.prototype.addCollection = function (name, isActive) {
        var newCollection = new collection_1.Collection(name, isActive);
        this.collections.insert(newCollection);
        this.db.saveDatabase();
        return newCollection.id;
    };
    DataStore.prototype.updateCollection = function (collection) {
        this.collections.update(collection);
        this.db.saveDatabase();
    };
    DataStore.prototype.activateCollection = function (id) {
        var _this = this;
        // Deactivate all collections
        var collections = this.collections.find();
        collections.forEach(function (x) {
            x.isActive = false;
            _this.collections.update(x);
        });
        // Activate the selected collection
        var collectionToActivate = this.getCollectionById(id);
        collectionToActivate.isActive = true;
        this.collections.update(collectionToActivate);
        // Persist
        this.db.saveDatabase();
    };
    DataStore.prototype.deleteCollection = function (id) {
        var _this = this;
        // Delete collection
        var collectionToDelete = this.getCollectionById(id);
        this.collections.remove(collectionToDelete);
        // Delete Notebooks
        var notebooksToDelete = this.notebooks.find({ 'collectionId': id });
        notebooksToDelete.forEach(function (x) { return _this.notebooks.remove(x); });
        // Delete Notes
        var notesToDelete = this.notes.find({ 'collectionId': id });
        notesToDelete.forEach(function (x) { return _this.notes.remove(x); });
        // Persist
        this.db.saveDatabase();
    };
    DataStore.prototype.getActiveCollection = function () {
        var activeCollection = this.collections.findOne({ 'isActive': true });
        return activeCollection;
    };
    DataStore.prototype.getNotebooks = function (collectionId) {
        var notebooks = this.notebooks.chain().find({ 'collectionId': collectionId }).sort(utils_1.Utils.caseInsensitiveNameSort).data();
        return notebooks;
    };
    DataStore.prototype.getNotebookById = function (id) {
        return this.notebooks.findOne({ 'id': id });
    };
    DataStore.prototype.getNotebookByName = function (collectionId, name) {
        return this.notebooks.findOne({ '$and': [{ 'collectionId': collectionId }, { 'name': name }] });
    };
    DataStore.prototype.addNotebook = function (collectionId, name) {
        var newNotebook = new notebook_1.Notebook(name, collectionId);
        this.notebooks.insert(newNotebook);
        this.db.saveDatabase();
        return newNotebook.id;
    };
    DataStore.prototype.deleteNotebook = function (id) {
        var notebookToDelete = this.getNotebookById(id);
        this.notebooks.remove(notebookToDelete);
        this.db.saveDatabase();
    };
    DataStore.prototype.getNotes = function (collectionId) {
        var notes = this.notes.chain().find({ 'collectionId': collectionId }).simplesort('modificationDate', true).data();
        return notes;
    };
    DataStore.prototype.getUnfiledNotes = function (collectionId) {
        var notebookIds = this.notebooks.chain().data().map(function (x) { return x.id; });
        var notes = this.notes.chain().where(function (obj) {
            return obj.collectionId === collectionId && (obj.notebookId === "" || !notebookIds.includes(obj.notebookId));
        }).simplesort('modificationDate', true).data();
        return notes;
    };
    DataStore.prototype.getMarkedNotes = function (collectionId) {
        var notes = this.notes.chain().find({ '$and': [{ 'collectionId': collectionId }, { 'isMarked': true }] }).simplesort('modificationDate', true).data();
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
    DataStore.prototype.addNote = function (title, notebookId, collectionId) {
        var newNote = new note_1.Note(title, notebookId, collectionId);
        this.notes.insert(newNote);
        this.db.saveDatabase();
        return newNote.id;
    };
    DataStore.prototype.getNoteById = function (id) {
        var note = this.notes.findOne({ 'id': id });
        return note;
    };
    DataStore.prototype.getNoteByTitle = function (collectionId, noteTitle) {
        return this.notes.findOne({ '$and': [{ 'collectionId': collectionId }, { 'title': noteTitle }] });
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