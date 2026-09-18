"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AIChatWidget from '@/components/AIChatWidget';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/login';
    }
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  const isOverview = pathname?.startsWith('/overview');
  const isHRSystem = isActive('/hr') || isActive('/employees') || isActive('/leaves');
  const isVehicleSystem = isActive('/fleet') || isActive('/assets') || isActive('/renewals');

  return (
    <div className={styles.layoutContainer}>
      
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className={styles.logo}>ADROIT PLATFORM</div>
        </Link>

        <div style={{ padding: '0 2rem', marginBottom: '1.5rem' }}>
          <Link 
            href="/" 
            className={styles.navItem}
            style={{ 
              justifyContent: 'center', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem',
              borderRadius: '12px'
            }}
          >
            🏠 Return to Main Page
          </Link>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>General</div>
          <nav className={styles.navMenu}>
            <Link 
              href="/overview" 
              className={`${styles.navItem} ${isOverview ? styles.active : ''}`}
            >
              🌐 Integrated Overview
            </Link>
          </nav>
        </div>

          {!isVehicleSystem && (
            <div className={styles.navGroup}>
              <div className={styles.navGroupTitle}>HR Management</div>
              <nav className={styles.navMenu}>
                <Link 
                  href="/hr" 
                  className={`${styles.navItem} ${isActive('/hr') ? styles.active : ''}`}
                >
                  📊 HR Dashboard
                </Link>
                <Link 
                  href="/employees" 
                  className={`${styles.navItem} ${pathname === '/employees' ? styles.active : ''}`}
                >
                  👥 Employee Register
                </Link>
                <Link 
                  href="/hr/employee-master" 
                  className={`${styles.navItem} ${pathname === '/hr/employee-master' ? styles.active : ''}`}
                >
                  📋 Employee Master
                </Link>
                <Link 
                  href="/leaves" 
                  className={`${styles.navItem} ${isActive('/leaves') ? styles.active : ''}`}
                >
                  📅 Leave Workflows
                </Link>
                <Link 
                  href="/documents" 
                  className={`${styles.navItem} ${isActive('/documents') ? styles.active : ''}`}
                >
                  📁 Document Centre
                </Link>
              </nav>
            </div>
          )}

          {!isHRSystem && (
            <div className={styles.navGroup}>
              <div className={styles.navGroupTitle}>Vehicle Management</div>
              <nav className={styles.navMenu}>
                <Link 
                  href="/fleet/register" 
                  className={`${styles.navItem} ${isActive('/fleet/register') ? styles.active : ''}`}
                >
                  🚛 Fleet Master
                </Link>
                <Link 
                  href="/assets" 
                  className={`${styles.navItem} ${isActive('/assets') ? styles.active : ''}`}
                >
                  🚙 Vehicle Profiles
                </Link>
                <Link 
                  href="/fleet/documents" 
                  className={`${styles.navItem} ${isActive('/fleet/documents') ? styles.active : ''}`}
                >
                  📄 Digital Document Centre
                </Link>
                <Link 
                  href="/fleet/process" 
                  className={`${styles.navItem} ${isActive('/fleet/process') ? styles.active : ''}`}
                >
                  🛤️ Document Process Board
                </Link>
                <Link 
                  href="/renewals" 
                  className={`${styles.navItem} ${isActive('/renewals') ? styles.active : ''}`}
                >
                  🔔 Expiry & Alert Centre
                </Link>
                <Link 
                  href="/fleet" 
                  className={`${styles.navItem} ${isActive('/fleet') && !isActive('/fleet/register') && !isActive('/fleet/documents') && !isActive('/fleet/process') && !isActive('/fleet/ai') ? styles.active : ''}`}
                >
                  📊 Management Dashboard
                </Link>
                <Link 
                  href="/fleet/ai" 
                  className={`${styles.navItem} ${isActive('/fleet/ai') ? styles.active : ''}`}
                >
                  🤖 AI Assistance
                </Link>
              </nav>
            </div>
          )}

      </aside>

      {/* Main Context Area */}
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.globalSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input 
              type="text" 
              placeholder="Search across employees, vehicles, documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.profileMenu} onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>System Admin</span>
              <span className={styles.userRole}>Super Administrator</span>
            </div>
            <div className={styles.avatar}>SA</div>
            
            {isProfileOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.dropdownHeader}>
                  <strong>System Admin</strong>
                  <span>admin@adroit.com</span>
                </div>
                <div className={styles.dropdownDivider} />
                <Link href="/profile" className={styles.dropdownItem}>
                  👤 User Profile
                </Link>
                <Link href="/settings" className={styles.dropdownItem}>
                  ⚙️ Settings
                </Link>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItemLogout} onClick={handleLogout}>
                  🚪 Logout Account
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Render Page Content */}
        {children}
      </main>

      {/* Global AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
