import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class ChatComponent implements OnInit {

  userMessage = '';
  messages: { sender: string, text: string }[] = [];
  conversationId!: number;
  userEmail: string = ''; // 🔥 user from JWT

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // 🔥 get conversation ID from route
    this.conversationId = +this.route.snapshot.paramMap.get('id')!;

    // 🔥 get user from JWT
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/signin';
      return;
    }
    const decoded: any = jwtDecode(token);
    this.userEmail = decoded.sub;
  }

  sendMessage() {
    const msg = this.userMessage.trim();
    if (!msg) return;

    this.messages.push({ sender: "User", text: msg });

    const token = localStorage.getItem('token'); // ✅ get token
    if (!token) return;

    this.http.post<any>(
      "http://localhost:8080/api/chat",
      {
        message: msg,
        conversationId: this.conversationId,
        userEmail: this.userEmail
      },
      {
        headers: { Authorization: `Bearer ${token}` } // ✅ send JWT in header
      }
    ).subscribe({
      next: (res) => {
        this.messages.push({ sender: "Bot", text: res.reply });
      },
      error: () => {
        this.messages.push({ sender: "Bot", text: "⚠️ Server error" });
      }
    });

    this.userMessage = '';
  }
}