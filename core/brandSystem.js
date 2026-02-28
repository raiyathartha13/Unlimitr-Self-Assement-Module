/**
 * UNLIMITR Brand System — Centralized Design Tokens
 * Production-grade brand consistency across all pages
 * 
 * Usage:
 *   import { BRAND_COLORS, BRAND_TYPOGRAPHY } from './core/brandSystem.js';
 *   Or use CSS variables defined in :root
 */

(function(global) {
  'use strict';

  // Brand Color Palette (Official)
  const BRAND_COLORS = {
    PRIMARY_INDIGO: '#0D3256',
    PRIMARY_GREEN: '#008944',
    BLUE_GRAY: '#0080DD',
    EARTH_YELLOW: '#FFC305',
    ALMOND: '#F1DACC',
    AMARANTH: '#FFA1E6',
    SKY_BLUE: '#23D2FF',
    DARK_PASTEL_RED: '#FF0A0A'
  };

  // Brand Typography
  const BRAND_TYPOGRAPHY = {
    PRIMARY_FONT: 'Outfit',
    BODY_FONT: 'Lato',
    SCALE: {
      HERO: 'clamp(34px, 5.5vw, 62px)',
      H1: 'clamp(28px, 4.5vw, 46px)',
      H2: 'clamp(24px, 4vw, 36px)',
      H3: 'clamp(20px, 3vw, 28px)',
      BODY: 'clamp(14px, 2vw, 17px)',
      SMALL: 'clamp(12px, 1.5vw, 14px)'
    }
  };

  // Brand Assets
  const BRAND_ASSETS = {
    LOGO_URL: 'https://unlimitr.com/img/hca_logo.svg',
    FAVICON_URL: 'https://unlimitr.com/img/hca_logo.svg'
  };

  // CSS Variables Generator
  function injectBrandCSS() {
    const style = document.createElement('style');
    style.id = 'brand-system-css';
    style.textContent = `
      :root {
        /* Brand Primary Colors */
        --primary-indigo: ${BRAND_COLORS.PRIMARY_INDIGO};
        --spanish-green: ${BRAND_COLORS.PRIMARY_GREEN};
        --primary-green: ${BRAND_COLORS.PRIMARY_GREEN};
        
        /* Brand Secondary Colors */
        --blue-gray: ${BRAND_COLORS.BLUE_GRAY};
        --earth-yellow: ${BRAND_COLORS.EARTH_YELLOW};
        --almond: ${BRAND_COLORS.ALMOND};
        --amaranth: ${BRAND_COLORS.AMARANTH};
        --sky-blue: ${BRAND_COLORS.SKY_BLUE};
        --dark-pastel-red: ${BRAND_COLORS.DARK_PASTEL_RED};
        
        /* Light Theme Palette */
        --bg: #FFFFFF;
        --bg-soft: #F8FAFC;
        --card-bg: rgba(255, 255, 255, 0.95);
        --card-border: rgba(13, 50, 86, 0.12);
        --card-shadow: 0 8px 30px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6);
        
        /* Text Colors (Light Theme) */
        --text-main: #0F172A;
        --text-secondary: #64748B;
        --text-muted: rgba(100, 116, 139, 0.7);
        --text-dim: rgba(100, 116, 139, 0.5);
        
        /* Accent Colors */
        --accent: var(--primary-indigo);
        --accent-secondary: var(--spanish-green);
        --accent-muted: rgba(13, 50, 86, 0.1);
        --accent-border: rgba(13, 50, 86, 0.2);
        
        /* Status Colors */
        --success: var(--spanish-green);
        --success-dim: rgba(0, 137, 68, 0.12);
        --warning: var(--earth-yellow);
        --warning-dim: rgba(255, 195, 5, 0.12);
        --error: var(--dark-pastel-red);
        --error-dim: rgba(255, 10, 10, 0.12);
        --info: var(--blue-gray);
        --info-dim: rgba(0, 128, 221, 0.12);
        
        /* Typography */
        --font-primary: '${BRAND_TYPOGRAPHY.PRIMARY_FONT}', system-ui, sans-serif;
        --font-body: '${BRAND_TYPOGRAPHY.BODY_FONT}', system-ui, sans-serif;
        
        /* Type Scale */
        --scale-hero: ${BRAND_TYPOGRAPHY.SCALE.HERO};
        --scale-h1: ${BRAND_TYPOGRAPHY.SCALE.H1};
        --scale-h2: ${BRAND_TYPOGRAPHY.SCALE.H2};
        --scale-h3: ${BRAND_TYPOGRAPHY.SCALE.H3};
        --scale-body: ${BRAND_TYPOGRAPHY.SCALE.BODY};
        --scale-small: ${BRAND_TYPOGRAPHY.SCALE.SMALL};
        
        /* Spacing & Radius */
        --radius: 20px;
        --radius-sm: 14px;
      }
    `;
    
    // Remove existing if present
    const existing = document.getElementById('brand-system-css');
    if (existing) existing.remove();
    
    document.head.appendChild(style);
  }

  // Auto-inject on load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectBrandCSS);
    } else {
      injectBrandCSS();
    }
  }

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      BRAND_COLORS,
      BRAND_TYPOGRAPHY,
      BRAND_ASSETS,
      injectBrandCSS
    };
  }

  // Global exposure
  if (typeof global !== 'undefined') {
    global.BRAND_SYSTEM = {
      colors: BRAND_COLORS,
      typography: BRAND_TYPOGRAPHY,
      assets: BRAND_ASSETS,
      injectCSS: injectBrandCSS
    };
  }
})(typeof window !== 'undefined' ? window : this);
