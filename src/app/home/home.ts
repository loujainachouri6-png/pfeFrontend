import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {

  conversations: any[] = [];
  newConversationName: string = '';
  userEmail: string = '';
  loaded = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {

    // ✅ 1. Load from localStorage FIRST (prevents UI flicker)
    const saved = localStorage.getItem('conversations');
    if (saved) {
      this.conversations = JSON.parse(saved);
      console.log("⚡ Loaded from localStorage:", this.conversations);
    }

    // 🚫 Prevent multiple executions
    if (this.loaded) return;

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/signin']);
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      this.userEmail = decoded.sub;

      console.log("👤 USER EMAIL:", this.userEmail);

      // ✅ 2. Call API AFTER showing cached data
      this.loadConversations(token);

      this.loaded = true;

    } catch (e) {
      console.error("❌ JWT ERROR:", e);
      localStorage.clear();
      this.router.navigate(['/signin']);
    }
  }

  // ✅ Load conversations
  loadConversations(token: string) {
    console.log("🔥 CALLING API with email:", this.userEmail);

    this.http.get<any[]>(`http://localhost:8080/api/conversations/email/${this.userEmail}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: data => {
        console.log("✅ RESPONSE:", data);

        if (Array.isArray(data)) {
          this.conversations = data;

          // ✅ 3. Save to localStorage
          localStorage.setItem('conversations', JSON.stringify(data));
        } else {
          console.warn("⚠️ Unexpected response format");
        }
      },
      error: err => {
        console.error("❌ ERROR LOADING CONVERSATIONS:", err);
      }
    });
  }

  // ✅ Start new conversation
  startConversation() {
    if (!this.newConversationName.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.post<any>(
      'http://localhost:8080/api/conversations',
      { userEmail: this.userEmail, name: this.newConversationName },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: conv => {
        console.log("🆕 CREATED:", conv);

        // ✅ Add instantly to UI
        this.conversations.push(conv);

        // ✅ Update localStorage
        localStorage.setItem('conversations', JSON.stringify(this.conversations));

        // 👉 Navigate
        this.router.navigate(['/chat', conv.id]);
      },
      error: err => {
        console.error("❌ ERROR CREATING CONVERSATION:", err);
      }
    });
  }

  openConversation(convId: number) {
    this.router.navigate(['/chat', convId]);
  }
}