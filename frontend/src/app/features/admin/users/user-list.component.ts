import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0 text-gray-800">Gestion des Utilisateurs</h1>
      </div>

      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">Liste des Utilisateurs</h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered" width="100%" cellspacing="0">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.lastname || user.nom }}</td>
                  <td>{{ user.firstname || user.prenom }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" [ngClass]="getRoleClass(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="user.isActive ? 'bg-success' : 'bg-danger'">
                      {{ user.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-info me-2" (click)="toggleActive(user)">
                      {{ user.isActive ? 'Désactiver' : 'Activer' }}
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deleteUser(user._id)">
                      Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .badge {
        padding: 0.5em 0.75em;
      }
    `,
  ],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users = res.users;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  toggleActive(user: any) {
    this.adminService.toggleUserActive(user._id).subscribe({
      next: () => this.loadUsers(),
    });
  }

  deleteUser(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
      });
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-danger';
      case 'store':
      case 'boutique':
        return 'bg-primary';
      case 'customer':
      case 'acheteur':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      store: 'Gérant',
      boutique: 'Gérant',
      customer: 'Client',
      acheteur: 'Client',
    };
    return labels[role] || role;
  }
}
