# Knowte change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2023-02-08

### Added

-   Added Mac support
-   Added spell checker
-   Added note font resizing using CTRL + mouse wheel
-   Added note status bar with quick options
-   Added note encryption and password protection
-   Added Russian translation
-   Added option to move notes from one collection to another
-   Added possibility to search inside notes

### Changed

-   Knowte can, upon confirmation, now close all open notes for you when switching collections.

### Removed

-   Removed import from Knowte 1.x

### Fixed

-   Fixed a bug where the collection switcher icon is invisible when using a dark header bar
-   Fixed extra new lines being added when copying note text to another application

## [2.0.9] - 2021-07-30

### Added

-   Added setting to use light header bar
-   Added Brazilian Portuguese translation
-   When browsing the settings or information pages, the logo changes to a back arrow.

### Changed

-   Update indicator is now non-intrusive

### Removed

### Fixed

-   Fixed a bug where performing an undo after opening a note, clears the note.
-   Fixed a bug where a color change was not applied to all opened windows.

## [2.0.8] - 2021-05-01

### Added

-   Added Undo and Redo button to notes.
-   Added Ctrl+Y as keyboard shortcut for Redo, in addition to the existing shortcut Shift+Ctrl+Z.

### Changed

### Removed

### Fixed

-   Fixed UI bugs when using a native title bar

## [2.0.7] - 2021-04-30

### Added

-   Added a Chinese translations
-   Added a Croatian translations

### Changed

-   The note title is now thinner

### Removed

### Fixed

## [2.0.6] - 2021-04-25

### Added

-   Added a trash bin for notes
-   It is now possible to resize the notebooks side bar

### Changed

### Removed

### Fixed

## [2.0.5] - 2020-10-10

### Added

-   Added a Japanese translation

### Changed

### Removed

### Fixed

-   Fixed a note import issue

## [2.0.4] - 2020-06-08

### Added

-   Added image resizing in the notes
-   Added an update checker

### Changed

### Removed

### Fixed

-   Fixed a small UI glitch in upper right corner of Settings and Information screens when using native titlebar
-   Fixed a crash that happens when pressing Cancel on the folder selection dialog on the Welcome screen
-   Fixed colors not being rendered correctly in Linux

## [2.0.3] - 2020-05-16

### Added

-   It is now possible to change the UI font size
-   Added tooltips to the note editor buttons
-   Added keyboard shortcuts CTRL+1 and CTRL+2 for headings 1 and 2 in notes
-   Added pacman and snap packages

### Changed

-   UI has been refined

### Removed

### Fixed

-   No icon in Linux when using AppImage install

## [2.0.2] - 2019-11-23

### Added

-   Added a context menu to the note editor

### Changed

### Removed

### Fixed

## [2.0.1] - 2019-11-23

### Added

### Changed

-   New UI design that more closely resembles the Knowte 1.x

### Removed

### Fixed

-   Tooltips don't adapt to the number of selected notes and notebooks
-   Font size not updated in open notes when font size setting is changed
-   Notebook name not updated in open notes when language setting is changed
-   Incorrect notification when removing multiple notebooks

## [2.0.0] - 2019-09-28

### Added

-   GNU/Linux compatibility (Knowte now runs on Windows and GNU/Linux)
-   Collections (e.g. allows separating home and work notes)
-   Export to PDF
-   Multiple text colors
-   Multiple text highlight colors
-   Dragging and dropping of notes to notebooks
-   Dropping of exported notes to notebooks and notes list to import them
-   Multi-select of notes and notebooks
-   Task lists

### Changed

-   The notes storage folder is no longer in a hidden folder and must be selected the first time the application starts. This allows storage of notes on a cloud folder.

### Removed

-   Linking to other note files
-   Export to RTF

### Fixed
