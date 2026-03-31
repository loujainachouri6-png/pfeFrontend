import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup';
import { SigninComponent } from './signin/signin';
import { ChatComponent } from './chat/chat';
import{AdminDashboard} from './admin-dashboard/admin-dashboard';
import { HomeComponent } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'signup', pathMatch: 'full' }, // 👈 default route

  { path: 'signup', component: SignupComponent }, // 👈 explicit signup
  { path: 'signin', component: SigninComponent },
  { path: 'chat/:id', component: ChatComponent },
  { path: 'home', component: HomeComponent },
  {path: 'AdminDashboard',component:AdminDashboard},

  { path: '**', redirectTo: 'signup' } // 👈 fallback (optional but good)
];