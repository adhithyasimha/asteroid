import React, { useState } from 'react';
import WalletConnect from './WalletConnect';
import logo from '../assets/asteroid-logo.png';
import homeIcon from '../assets/home-icon.svg';
import fileIcon from '../assets/file-icon.svg';
import aboutIcon from '../assets/about-icon.svg';


const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      {/* Left Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src={logo} alt="Asteroid Logo" />
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item">
            <span className="nav-icon">
              <img src={homeIcon} alt="Home Icon" />
            </span>
            <span className="nav-text">Home</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">
              <img src={fileIcon} alt="File Icon" />
            </span>
            <span className="nav-text">My Files</span>
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">
              <img src={aboutIcon} alt="About Icon" />
            </span>
            <span className="nav-text">About</span>
          </a>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <div className="content-wrapper">
        <header>
          {/* Mobile only - hamburger for sidebar */}
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className="burger-bar"></div>
            <div className="burger-bar"></div>
            <div className="burger-bar"></div>
          </button>
          
          <div className="header-title">
            <h1>Asteriod</h1>
          </div>
          
          <div className="wallet-container">
            <WalletConnect />
          </div>
        </header>
        
        <main>
          {children}
        </main>
        
        <footer>
          <p>Decentralized Storage powered by IPFS and Ethereum</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;