"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var electron_log_1 = require("electron-log");
var noteMarkChangedArgs_1 = require("./noteMarkChangedArgs");
var renameNoteResult_1 = require("./renameNoteResult");
var collectionOperation_1 = require("./collectionOperation");
var Store = require("electron-store");
var fs = require("fs-extra");
var constants_1 = require("../core/constants");
var path = require("path");
/**
 * Angular services cannot be configured as singletons across Electron windows. So we use this class, which we
 * set as a global main process variable, and then use it as a app-wide singleton to send events across windows.
 */
var NoteService = /** @class */ (function () {
    function NoteService() {
        this.settings = new Store();
        this.openNoteIds = [];
        this.globalAny = global;
        this.dataStore = this.globalAny.dataStore;
        this.noteRenamed = new rxjs_1.Subject();
        this.noteRenamed$ = this.noteRenamed.asObservable();
        this.noteMarkChanged = new rxjs_1.Subject();
        this.noteMarkChanged$ = this.noteMarkChanged.asObservable();
    }
    NoteService.prototype.openNote = function (noteId) {
        if (!this.openNoteIds.includes(noteId)) {
            this.openNoteIds.push(noteId);
        }
    };
    NoteService.prototype.closeNote = function (noteId) {
        if (this.openNoteIds.includes(noteId)) {
            this.openNoteIds.splice(this.openNoteIds.indexOf(noteId), 1);
        }
    };
    NoteService.prototype.noteIsOpen = function (noteId) {
        return this.openNoteIds.includes(noteId);
    };
    NoteService.prototype.noteExists = function (noteTitle) {
        var activeCollection = this.dataStore.getActiveCollection();
        var note = this.dataStore.getNoteByTitle(activeCollection.id, noteTitle);
        return note != null;
    };
    NoteService.prototype.getSimilarTitles = function (baseTitle) {
        var notesWithIdenticalBaseTitle = this.dataStore.getNotesWithIdenticalBaseTitle(baseTitle);
        return notesWithIdenticalBaseTitle.map(function (x) { return x.title; });
    };
    NoteService.prototype.getUniqueNoteNoteTitle = function (baseTitle) {
        var similarTitles = [];
        var counter = 0;
        var uniqueTitle = baseTitle;
        similarTitles = this.getSimilarTitles(baseTitle);
        while (similarTitles.includes(uniqueTitle)) {
            counter++;
            uniqueTitle = baseTitle + " (" + counter + ")";
        }
        return uniqueTitle;
    };
    // public updateNote(note: Note): CollectionOperation {
    //   try {
    //     this.dataStore.updateNote(note);
    //   } catch (error) {
    //     log.error(`Could not update the note with id='${note.id}' to '${note.title}'. Cause: ${error}`);
    //     return CollectionOperation.Error;
    //   }
    //   return CollectionOperation.Success;
    // }
    NoteService.prototype.setNoteMark = function (noteId, isMarked) {
        // Update note in the data store
        var note = this.dataStore.getNote(noteId);
        note.isMarked = isMarked;
        this.dataStore.updateNote(note);
        // Update counters
        var activeCollection = this.dataStore.getActiveCollection();
        var markedNotes = this.dataStore.getMarkedNotes(activeCollection.id);
        var args = new noteMarkChangedArgs_1.NoteMarkChangedArgs(noteId, isMarked, markedNotes.length);
        this.noteMarkChanged.next(args);
    };
    NoteService.prototype.renameNote = function (noteId, originalNoteTitle, newNoteTitle) {
        if (!noteId || !originalNoteTitle) {
            electron_log_1.default.error("renameNote: noteId or originalNoteTitle is null");
            return new renameNoteResult_1.RenameNoteResult(collectionOperation_1.CollectionOperation.Error);
        }
        var uniqueNoteTitle = newNoteTitle.trim();
        if (uniqueNoteTitle.length === 0) {
            return new renameNoteResult_1.RenameNoteResult(collectionOperation_1.CollectionOperation.Blank);
        }
        if (originalNoteTitle === uniqueNoteTitle) {
            electron_log_1.default.error("New title is the same as old title. No rename required.");
            return new renameNoteResult_1.RenameNoteResult(collectionOperation_1.CollectionOperation.Aborted);
        }
        try {
            // 1. Make sure the new title is unique
            uniqueNoteTitle = this.getUniqueNoteNoteTitle(newNoteTitle);
            // 2. Rename the note
            var note = this.dataStore.getNote(noteId);
            note.title = uniqueNoteTitle;
            this.dataStore.updateNote(note);
        }
        catch (error) {
            electron_log_1.default.error("Could not rename the note with id='" + noteId + "' to '" + uniqueNoteTitle + "'. Cause: " + error);
            return new renameNoteResult_1.RenameNoteResult(collectionOperation_1.CollectionOperation.Error);
        }
        var renameNoteResult = new renameNoteResult_1.RenameNoteResult(collectionOperation_1.CollectionOperation.Success);
        renameNoteResult.noteId = noteId;
        renameNoteResult.newNoteTitle = uniqueNoteTitle;
        this.noteRenamed.next(renameNoteResult);
        return renameNoteResult;
    };
    NoteService.prototype.updateNoteContent = function (noteId, textContent, jsonContent) {
        if (!noteId) {
            electron_log_1.default.error("updateNoteContent: noteId is null");
            return collectionOperation_1.CollectionOperation.Error;
        }
        try {
            // Update the note file on disk
            var storageDirectory = this.settings.get('storageDirectory');
            fs.writeFileSync(path.join(storageDirectory, "" + noteId + constants_1.Constants.noteExtension), jsonContent);
            // Update the note in the data store
            var note = this.dataStore.getNote(noteId);
            note.text = textContent;
            this.dataStore.updateNote(note);
        }
        catch (error) {
            electron_log_1.default.error("Could not update the content for the note with id='" + noteId + "'. Cause: " + error);
            return collectionOperation_1.CollectionOperation.Error;
        }
        return collectionOperation_1.CollectionOperation.Success;
    };
    return NoteService;
}());
exports.NoteService = NoteService;
//# sourceMappingURL=note.service.js.map