"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ast_1 = require("../utils/ast");
const component_1 = require("../utils/devkit-utils/component");
/**
 * Scaffolds a new table component.
 * Internally it bootstraps the base component schematic
 */
function default_1(options) {
    return schematics_1.chain([
        component_1.buildComponent(Object.assign({}, options)),
        options.skipImport ? schematics_1.noop() : addFormModulesToModule(options)
    ]);
}
exports.default = default_1;
/**
 * Adds the required modules to the relative module.
 */
function addFormModulesToModule(options) {
    return (host) => {
        const modulePath = ast_1.findModuleFromOptions(host, options);
        ast_1.addModuleImportToModule(host, modulePath, 'MatInputModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatButtonModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatSelectModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatRadioModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'MatCardModule', '@angular/material');
        ast_1.addModuleImportToModule(host, modulePath, 'ReactiveFormsModule', '@angular/forms');
        return host;
    };
}
//# sourceMappingURL=index.js.map