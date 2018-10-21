import { NotesComponent } from './components/notes/notes.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InformationComponent } from './components/information/information.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/notes', 
        pathMatch: 'full' 
    },
    {
        path: 'notes',
        component: NotesComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    },
    {
        path: 'information',
        component: InformationComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
