import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, SecurityEventDto } from '../../services/user.service';
import { UiToastService } from '../../core/services/ui-toast.service';

@Component({
  selector: 'app-security-activity',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './security-activity.component.html',
  styleUrl: './security-activity.component.scss',
})
export class SecurityActivityComponent implements OnInit {
  events: SecurityEventDto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private toast: UiToastService,
  ) {}

  ngOnInit(): void {
    this.loadSecurityActivity();
  }

  loadSecurityActivity(): void {
    this.isLoading = true;
    this.error = null;
    this.userService.getSecurityActivity().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load security activity', err);
        this.error = 'Could not load your security events. Please try again.';
        this.isLoading = false;
        this.toast.error(
          'Load failed',
          'Failed to retrieve security activity.',
        );
      },
    });
  }

  retry(): void {
    this.loadSecurityActivity();
  }

  getFriendlyEventType(type: string): string {
    switch (type) {
      case 'LOGIN':
        return 'Account Login';
      case 'LOGOUT':
        return 'Account Logout';
      case 'REGISTER':
        return 'Account Registration';
      case 'TOKEN_REFRESH':
        return 'Session Refreshed';
      case 'PASSWORD_CHANGE':
        return 'Password Changed';
      case 'NEW_DEVICE_DETECTED':
        return 'New Device Detected';
      case 'VAULT_UNLOCKED':
        return 'Vault Unlocked';
      case 'VAULT_LOCKED':
        return 'Vault Locked';
      default:
        return type;
    }
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'LOGIN':
        return 'pi-sign-in';
      case 'LOGOUT':
        return 'pi-sign-out';
      case 'REGISTER':
        return 'pi-user-plus';
      case 'TOKEN_REFRESH':
        return 'pi-refresh';
      case 'PASSWORD_CHANGE':
        return 'pi-key';
      case 'NEW_DEVICE_DETECTED':
        return 'pi-desktop';
      case 'VAULT_UNLOCKED':
        return 'pi-lock-open';
      case 'VAULT_LOCKED':
        return 'pi-lock';
      default:
        return 'pi-shield';
    }
  }

  isHighlightEvent(type: string): boolean {
    return type === 'NEW_DEVICE_DETECTED' || type === 'LOGIN';
  }

  getFriendlyDevice(userAgent: string): string {
    if (!userAgent || userAgent === 'unknown') return 'Unknown Device';

    let os = 'Unknown OS';
    if (userAgent.indexOf('Windows') !== -1) os = 'Windows';
    else if (
      userAgent.indexOf('Macintosh') !== -1 ||
      userAgent.indexOf('Mac OS') !== -1
    )
      os = 'macOS';
    else if (userAgent.indexOf('Android') !== -1) os = 'Android';
    else if (
      userAgent.indexOf('iPhone') !== -1 ||
      userAgent.indexOf('iPad') !== -1
    )
      os = 'iOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';

    let browser = 'Unknown Browser';
    if (
      userAgent.indexOf('Chrome') !== -1 &&
      userAgent.indexOf('Chromium') === -1 &&
      userAgent.indexOf('Edg') === -1
    )
      browser = 'Chrome';
    else if (
      userAgent.indexOf('Safari') !== -1 &&
      userAgent.indexOf('Chrome') === -1
    )
      browser = 'Safari';
    else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (userAgent.indexOf('Edg') !== -1) browser = 'Edge';
    else if (
      userAgent.indexOf('Opera') !== -1 ||
      userAgent.indexOf('OPR') !== -1
    )
      browser = 'Opera';

    if (os === 'Unknown OS' && browser === 'Unknown Browser') {
      return userAgent.length > 50
        ? userAgent.substring(0, 50) + '...'
        : userAgent;
    }
    return `${browser} on ${os}`;
  }

  trackById(_index: number, item: SecurityEventDto): number {
    return item.id;
  }
}
