![Knowte](Knowte.logo.full.png)

# Knowte

Knowte is a note taking application that allows you to quickly and easily organize and find your notes. This version is written using Electron, Angular and Typescript. The original Knowte (for Windows), which is written in WPF and C#, remains available <a href="https://github.com/digimezzo/knowte-windows">here</a>.

[![Release](https://img.shields.io/github/release/digimezzo/Knowte.svg?style=flat-square&include_prereleases)](https://github.com/digimezzo/knowte/releases/latest)
[![Issues](https://img.shields.io/github/issues/digimezzo/Knowte.svg?style=flat-square)](https://github.com/digimezzo/knowte/issues)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MQALEWTEZ7HX8)

<a href='https://ko-fi.com/S6S11K63U' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://az743702.vo.msecnd.net/cdn/kofi1.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/knowte)

## Screenshot

![Knowte2screenshot](Knowte.showcase.dark.png)

![Knowte2screenshot](Knowte.showcase.light.png)

## Build prerequisites

-   wine: required to build Windows package
-   rpm: required to build rpm package
-   libarchive-tools: contains bsdtar, which is required to build pacman package.

**To install the prerequisites on Ubuntu:**

sudo apt install wine rpm libarchive-tools

**To install the prerequisites on Arch Linux and Manjaro:**

sudo pacman -S wine rpm-tools

## Build instructions

```bash
$ git clone https://github.com/digimezzo/knowte.git
$ cd knowte
$ npm install            # Download dependencies
$ npm start              # Start Knowte
$ npm run electron:windows   # Build for Windows
$ npm run electron:linux     # Build for Linux
$ npm run electron:mac       # Build for Mac
```

## Data store lifecycle

`CollectionService` uses an injected `CollectionDataStoreAccess`, which in turn
receives an injected `DataStore`. Tests can replace either dependency without
constructing a LokiJS database.

Await `CollectionService.initializeAsync()` before using the collection. Concurrent
callers share initialization, and failures reject the promise and allow a retry.
`DataStore.initializeAsync(databaseFile)` resolves only after loading and any
required initial save complete; synchronous data operations throw until the store
is ready. Database switches must be awaited and cannot overlap initialization of
another database.

Only the main window opens collection databases. Note windows use
`CollectionClient` to send requests to the main window's `CollectionService`;
Angular dependency injection does not share instances between windows.
Cross-collection moves open a separate destination store through
`DataStoreFactory`, leaving the active store available to other note windows.
The destination is saved before source notes are deleted. Failed copies retain
the source notes, but may leave partial copies in the destination.

Moves and collection changes cannot overlap. Before switching, adding, renaming,
or deleting collections, open note windows must acknowledge saving and closing,
and pending database writes are flushed. A failed save prevents the change.

## Pacman installation notes

The pacman package can be installed using this command (replace x.y.z with the correct version number):

`$ sudo pacman -U Knowte-x.y.z.pacman`

If you're getting an error concerning a missing package libappindicator-sharp, use this command to perform the installation instead (replace x.y.z with the correct version number):

`$ sudo pacman -U Knowte-x.y.z.pacman --assume-installed libappindicator-sharp`
