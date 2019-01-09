import { MainComponent } from './components/main/main.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InformationComponent } from './components/information/information.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoadingComponent } from './components/loading/loading.component';

const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/loading', 
        pathMatch: 'full' 
    },
    {
        path: 'note',
        component: InformationComponent
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
        path: 'main',
        component: MainComponent
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
