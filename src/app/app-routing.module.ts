import { CollectionComponent } from './components/collection/collection.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InformationComponent } from './components/information/information.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NoteComponent } from './components/note/note.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/loading',
        pathMatch: 'full'
    },
    {
        path: 'note',
        component: NoteComponent
    },
    {
        path: 'welcome',
        component: WelcomeComponent
    },
    {
        path: 'loading',
        component: LoadingComponent
    },
    {
        path: 'collection',
        component: CollectionComponent
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
