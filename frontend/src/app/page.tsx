"use client";

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/login';
    }
  };

  return (
    <div className={styles.landingWrapper}>
      {/* Abstract Backgrounds */}
      <div className={styles.glowContainer}>
        <div className={styles.bgGlow}></div>
        <div className={styles.bgGlow2}></div>
      </div>

      {/* Premium Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <img src="/logo.jpg" alt="Adroit Logo" className={styles.logoImage} />
          ADROIT PLATFORM
        </div>
        <div className={styles.navLinks}>
          <Link href="#" className={styles.navLink}>Company</Link>
          <Link href="#" className={styles.navLink}>Support</Link>
          
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
        </div>
      </nav>

      {/* Hero Section */}
      <div className={styles.heroWrapper}>
        <div className={styles.heroBgOverlay}></div>
        <section className={styles.hero}>
          <div className={styles.heroLogoContainer}>
            <img src="/logo.jpg" alt="Adroit Logo Large" className={styles.heroLogoImage} />
          </div>
          <div className={styles.heroTextContainer}>
            <h1>Integrated Operations, Perfectly Synchronized.</h1>
            <p>A unified architecture orchestrating your entire enterprise. Seamlessly manage human capital and mobile assets from a single, ultra-premium interface with <strong>AI-driven real-time analytics and automated workflow processing.</strong></p>
          </div>
        </section>
      </div>

      {/* Real-time Moving Photo Wall */}
      <div className={styles.photoWallContainer}>
        <div className={styles.photoWallTrack}>
          {/* First Set */}
          <div className={styles.photoWallItem}>
            <img src="/images/hr.jpg" alt="HR Managing" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Human Capital Management</h3>
              <p>Orchestrating global talent with precision and AI-driven insights.</p>
            </div>
          </div>
          <div className={styles.photoWallItem}>
            <img src="/images/vehicle.jpg" alt="Vehicle Managing" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Fleet Logistics</h3>
              <p>Real-time vehicle tracking and proactive maintenance scheduling.</p>
            </div>
          </div>
          <div className={styles.photoWallItem}>
            <img src="/images/equipment.jpg" alt="Equipment Managing" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Asset Infrastructure</h3>
              <p>Heavy machinery and construction equipment lifecycle tracking.</p>
            </div>
          </div>
          <div className={styles.photoWallItem}>
            <img src="/images/dubai.jpg" alt="Dubai Building" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Global Operations</h3>
              <p>Scaling infrastructure across smart cities and modern hubs.</p>
            </div>
          </div>
          {/* Duplicated Set for Seamless Loop */}
          <div className={styles.photoWallItem}>
            <img src="/images/hr.jpg" alt="HR Managing" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Human Capital Management</h3>
              <p>Orchestrating global talent with precision and AI-driven insights.</p>
            </div>
          </div>
          <div className={styles.photoWallItem}>
            <img src="/images/vehicle.jpg" alt="Vehicle Managing" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Fleet Logistics</h3>
              <p>Real-time vehicle tracking and proactive maintenance scheduling.</p>
            </div>
          </div>
          <div className={styles.photoWallItem}>
            <img src="/images/equipment.jpg" alt="Equipment Managing" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Asset Infrastructure</h3>
              <p>Heavy machinery and construction equipment lifecycle tracking.</p>
            </div>
          </div>
          <div className={styles.photoWallItem}>
            <img src="/images/dubai.jpg" alt="Dubai Building" className={styles.photoWallImage} />
            <div className={styles.photoWallOverlay}>
              <h3>Global Operations</h3>
              <p>Scaling infrastructure across smart cities and modern hubs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Two Main Systems */}
      <section className={styles.systemsContainer}>
        
        {/* System 1: HR Management */}
        <Link href="/hr" className={`${styles.systemCard} ${styles.hrCard}`}>
          <div className={styles.systemHeader}>
            <div className={`${styles.systemIcon} ${styles.hrIcon}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h2>HR Management System</h2>
            <p>Complete lifecycle management, compliance tracking, and dynamic workflow automation for your workforce.</p>
          </div>
          
          <div className={styles.subSystemsTitle}>Integrated Co-Systems</div>
          <div className={styles.subSystemsGrid}>
            <div className={styles.subSystem}>
              <h3>HR Dashboard</h3>
              <p>Global KPI overviews & AI-driven alerts.</p>
            </div>
            <div className={styles.subSystem}>
              <h3>Document Centre</h3>
              <p>Immutable storage for Visas, Passports, and IDs.</p>
            </div>
            <div className={styles.subSystem}>
              <h3>Leave Workflows</h3>
              <p>Digital approval chains & vacation tracking.</p>
            </div>
            <div className={styles.subSystem}>
              <h3>Employee Profiles</h3>
              <p>Master data management & history tracking.</p>
            </div>
          </div>
          
          <button className={styles.enterSystemBtn}>
            Enter HR System →
          </button>
        </Link>

        {/* System 2: Vehicle Management */}
        <Link href="/fleet" className={`${styles.systemCard} ${styles.fleetCard}`}>
          <div className={styles.systemHeader}>
            <div className={`${styles.systemIcon} ${styles.fleetIcon}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h2>Vehicle Management System</h2>
            <p>End-to-end fleet tracking, preventative maintenance, and strict regulatory compliance management.</p>
          </div>
          
          <div className={styles.subSystemsTitle}>Integrated Co-Systems</div>
          <div className={styles.subSystemsGrid}>
            <div className={styles.subSystem}>
              <h3>Fleet Dashboard</h3>
              <p>Asset utilization & maintenance analytics.</p>
            </div>
            <div className={styles.subSystem}>
              <h3>Vehicle Document Control</h3>
              <p>Registrations, Insurance, & Permits tracking.</p>
            </div>
            <div className={styles.subSystem}>
              <h3>Asset Profiles</h3>
              <p>Make, model, chassis, and lifecycle data.</p>
            </div>
            <div className={styles.subSystem}>
              <h3>Renewal Centre</h3>
              <p>Proactive alerting for fleet compliance.</p>
            </div>
          </div>
          
          <button className={styles.enterSystemBtn}>
            Enter Vehicle System →
          </button>
        </Link>

      </section>

      {/* Advertisements / Announcements Section */}
      <section className={styles.adsContainer}>
        <div className={styles.adsGrid}>
          <div className={styles.adCard}>
            <div style={{overflow: 'hidden'}}><img src="/telematics.jpg" alt="Fleet Telematics" className={styles.adImage} /></div>
            <div className={styles.adContent}>
              <span className={styles.adBadge}>New Release</span>
              <h3>Adroit Fleet Telematics</h3>
              <p>Experience real-time GPS tracking and fuel analytics directly integrated into your Vehicle Management Dashboard. Upgrade today for 20% off your annual license.</p>
            </div>
          </div>
          <div className={styles.adCard}>
            <div style={{overflow: 'hidden'}}><img src="/security.jpg" alt="Security Certification" className={styles.adImage} /></div>
            <div className={styles.adContent}>
              <span className={styles.adBadge}>Announcement</span>
              <h3>ISO 27001 Certification</h3>
              <p>Your data is more secure than ever. We're proud to announce that the Adroit Platform infrastructure is now fully certified for global data security standards.</p>
            </div>
          </div>
          <div className={styles.adCard}>
            <div style={{overflow: 'hidden'}}><img src="/ai.jpg" alt="AI Webinar" className={styles.adImage} /></div>
            <div className={styles.adContent}>
              <span className={styles.adBadge}>Webinar</span>
              <h3>Mastering AI Workflows</h3>
              <p>Join our lead engineers on Oct 12th to discover how to fully utilize the new AI Real-Time Processing engine for instant leave approvals and compliance alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h2>Adroit.</h2>
            <p>Empowering global enterprises with a unified architecture for human capital and mobile asset management. Built for scale, secured by design.</p>
          </div>
          <div className={styles.footerColumn}>
            <h4>Platform</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#">HR Management</a></li>
              <li><a href="#">Vehicle & Fleet</a></li>
              <li><a href="#">AI Automation</a></li>
              <li><a href="#">Security & Compliance</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>Company</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press & Media</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>Legal</h4>
            <ul className={styles.footerLinks}>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Security Overview</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Adroit Platform. All rights reserved.</p>
          <div className={styles.footerSocials}>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

