import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {

  userEmail: string = '';

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      this.userEmail = decoded.sub;
    } catch (e) {
      localStorage.clear();
      window.location.href = '/signin';
    }
  }
}