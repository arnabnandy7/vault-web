import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import {
  EXTERNAL_DOMAIN_LINKS,
  ExternalDomainLink,
  resolveExternalLinkUrl,
} from '../config/external-domains.config';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isMobileMenuOpen = false;
  isDomainDropdownOpen = false;
  readonly externalDomainLinks: ExternalDomainLink[] = EXTERNAL_DOMAIN_LINKS;

  constructor(
    public themeService: ThemeService,
    private authService: AuthService,
  ) {}

  @HostListener('document:click')
  closeDomainDropdownOnOutsideClick(): void {
    this.isDomainDropdownOpen = false;
  }

  toggleMobileMenu() {
    this.closeDomainDropdown();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleDomainDropdown(event: Event): void {
    if (!this.hasExternalLinks) {
      return;
    }
    event.stopPropagation();
    this.isDomainDropdownOpen = !this.isDomainDropdownOpen;
  }

  closeDomainDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isDomainDropdownOpen = false;
  }

  get isDarkTheme(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  get hasExternalLinks(): boolean {
    return this.externalDomainLinks.length > 0;
  }

  externalLinkUrl(link: ExternalDomainLink): string {
    return resolveExternalLinkUrl(link, this.authService.getToken());
  }

  openExternalLink(event: Event, link: ExternalDomainLink): void {
    this.closeMobileMenu();
    this.closeDomainDropdown(event);

    if (!link.forwardVaultWebToken || !this.authService.getToken()) {
      return;
    }

    event.preventDefault();
    this.authService.refresh().subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        window.location.assign(resolveExternalLinkUrl(link, res.token));
      },
      error: () => {
        window.location.assign(this.externalLinkUrl(link));
      },
    });
  }

  logout(): void {
    this.closeMobileMenu();
    this.closeDomainDropdown();
    this.authService.logout();
  }
}
