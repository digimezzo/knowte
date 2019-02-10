"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Store = require("electron-store");
var loki = require("lokijs");
var path = require("path");
var constants_1 = require("../core/constants");
var collection_1 = require("./collection");
var nanoid = require("nanoid");
var notebook_1 = require("./notebook");
var note_1 = require("./note");
var moment = require("moment");
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
            this.collections.insert(new collection_1.Collection(constants_1.Constants.defaultCollectionName, nanoid(), true));
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
    DataStore.prototype.caseInsensitiveNameSort = function (object1, object2) {
        return object1.name.toLowerCase().localeCompare(object2.name.toLowerCase());
    };
    DataStore.prototype.getAllCollections = function () {
        return this.collections.chain().sort(this.caseInsensitiveNameSort).data();
    };
    DataStore.prototype.getCollection = function (collectionId) {
        return this.collections.findOne({ 'id': collectionId });
    };
    DataStore.prototype.getCollectionByName = function (collectionName) {
        return this.collections.findOne({ 'name': collectionName });
    };
    DataStore.prototype.addCollection = function (collectionName, isActive) {
        var collectionId = nanoid();
        this.collections.insert(new collection_1.Collection(collectionName, collectionId, isActive));
        this.db.saveDatabase();
        return collectionId;
    };
    DataStore.prototype.setCollectionName = function (collectionId, collectionName) {
        var collectionToRename = this.getCollection(collectionId);
        collectionToRename.name = collectionName;
        this.collections.update(collectionToRename);
        this.db.saveDatabase();
    };
    DataStore.prototype.activateCollection = function (collectionId) {
        var _this = this;
        // Deactivate all collections
        var collections = this.collections.find();
        collections.forEach(function (x) {
            x.isActive = false;
            _this.collections.update(x);
        });
        // Activate the selected collection
        var collectionToActivate = this.getCollection(collectionId);
        collectionToActivate.isActive = true;
        this.collections.update(collectionToActivate);
        // Persist
        this.db.saveDatabase();
    };
    DataStore.prototype.deleteCollection = function (collectionId) {
        var _this = this;
        // Remove collection
        var collectionToRemove = this.getCollection(collectionId);
        this.collections.remove(collectionToRemove);
        // Remove Notebooks
        var notebooksToRemove = this.notebooks.find({ 'collectionId': collectionId });
        notebooksToRemove.forEach(function (x) { return _this.notebooks.remove(x); });
        // Remove Notes
        var notesToRemove = this.notes.find({ 'collectionId': collectionId });
        notesToRemove.forEach(function (x) { return _this.notes.remove(x); });
        // Persist
        this.db.saveDatabase();
    };
    DataStore.prototype.getActiveCollection = function () {
        var activeCollection = this.collections.findOne({ 'isActive': true });
        return activeCollection;
    };
    DataStore.prototype.getNotebookByName = function (collectionId, notebookName) {
        return this.notebooks.findOne({ '$and': [{ 'collectionId': collectionId }, { 'name': notebookName }] });
    };
    DataStore.prototype.addNotebook = function (collectionId, notebookName) {
        var newNotebook = new notebook_1.Notebook(notebookName, collectionId);
        this.notebooks.insert(newNotebook);
        this.db.saveDatabase();
        return newNotebook.id;
    };
    DataStore.prototype.getNotebooks = function (collectionId) {
        var notebooks = this.notebooks.chain().find({ 'collectionId': collectionId }).sort(this.caseInsensitiveNameSort).data();
        return notebooks;
    };
    DataStore.prototype.getNotebook = function (notebookId) {
        return this.notebooks.findOne({ 'id': notebookId });
    };
    DataStore.prototype.setNotebookName = function (notebookId, notebookName) {
        var notebookToRename = this.getNotebook(notebookId);
        notebookToRename.name = notebookName;
        this.notebooks.update(notebookToRename);
        this.db.saveDatabase();
    };
    DataStore.prototype.deleteNotebook = function (notebookId) {
        // Remove notebook
        var notebookToRemove = this.getNotebook(notebookId);
        this.notebooks.remove(notebookToRemove);
        // Persist
        this.db.saveDatabase();
    };
    DataStore.prototype.getAllNotes = function (collectionId) {
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
    DataStore.prototype.getNotes = function (notebookId) {
        var notes = this.notes.chain().find({ 'notebookId': notebookId }).simplesort('modificationDate', true).data();
        return notes;
    };
    DataStore.prototype.getNotesWithIdenticalBaseTitle = function (baseTitle) {
        var notesWithIdenticalBaseTitle = this.notes.chain().where(function (obj) {
            return obj.title.startsWith(baseTitle);
        }).data();
        return notesWithIdenticalBaseTitle;
    };
    DataStore.prototype.addNote = function (noteTitle, notebookId, collectionId) {
        var newNote = new note_1.Note(noteTitle, notebookId, collectionId);
        this.notes.insert(newNote);
        this.db.saveDatabase();
        return newNote.id;
    };
    DataStore.prototype.getNote = function (noteId) {
        var note = this.notes.findOne({ 'id': noteId });
        return note;
    };
    DataStore.prototype.getNoteByTitle = function (collectionId, noteTitle) {
        return this.notes.findOne({ '$and': [{ 'collectionId': collectionId }, { 'title': noteTitle }] });
    };
    DataStore.prototype.deleteNote = function (noteId) {
        var noteToRemove = this.getNote(noteId);
        this.notes.remove(noteToRemove);
        this.db.saveDatabase();
    };
    DataStore.prototype.updateNote = function (note) {
        this.notes.update(note);
        note.modificationDate = moment().valueOf();
        this.db.saveDatabase();
        return note.id;
    };
    DataStore.prototype.setNoteIsOpen = function (noteId, isOpen) {
        var note = this.notes.findOne({ 'id': noteId });
        note.isOpen = isOpen;
        this.notes.update(note);
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