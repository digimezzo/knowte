![Knowte](Knowte-logo.full.png)

# Knowte

Knowte is a note taking application that allows you to quickly and easily organize and find your notes. This version is written using Electron, Angular and Typescript. The original Knowte (for Windows), which is written in WPF and C#, remains available <a href="https://github.com/digimezzo/knowte-windows">here</a>.

[![Release](https://img.shields.io/github/release/digimezzo/Knowte.svg?style=flat-square&include_prereleases)](https://github.com/digimezzo/knowte/releases/latest)
[![Issues](https://img.shields.io/github/issues/digimezzo/Knowte.svg?style=flat-square)](https://github.com/digimezzo/knowte/issues)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MQALEWTEZ7HX8)

<a href='https://ko-fi.com/S6S11K63U' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://az743702.vo.msecnd.net/cdn/kofi1.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/knowte)

## Screenshot

![Knowte2screenshot](Knowte.showcase.png)

## Build prerequisites

- wine: required to build Windows package
- rpm: required to build rpm package
- libarchive-tools: contains bsdtar, which is required to build pacman package.

**To install the prerequisites on Ubuntu:**

sudo apt install wine rpm libarchive-tools

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

## Pacman installation notes

The pacman package contains a dependency to package libappindicator-sharp, which is no longer distributed with Arch Linux. I cannot remove this dependency for now, because it is an issue in electron-builder (the packaging tool which is used in this project). It is, however, possible to install Knowte on Arch Linux or Manjaro using this command (replace x.y.z with the correct version number): 

`$ sudo pacman -U Knowte-x.y.z.pacman --assume-installed libappindicator-sharp`
