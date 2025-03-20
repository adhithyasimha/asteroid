import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletConnect = () => {
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: "eth_requestAccounts" 
        });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        
        // Add event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } else {
        alert('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };
  
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setIsConnected(false);
      setAccount('');
    } else {
      setAccount(accounts[0]);
    }
  };
  
  const handleChainChanged = (chainIdHex) => {
    setChainId(parseInt(chainIdHex, 16));
    // Reload the page as recommended by MetaMask
    window.location.reload();
  };

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts"
          });
          
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            
            setAccount(accounts[0]);
            setChainId(Number(network.chainId));
            setIsConnected(true);
            
            // Add event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };
    
    checkConnection();
    
    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const getNetworkName = (chainId) => {
    switch(chainId) {
      case 1: return 'Ethereum';
      case 11155111: return 'Sepolia';
      case 80001: return 'Mumbai';
      case 137: return 'Polygon';
      case 5: return 'Goerli';
      default: return `Chain ID: ${chainId}`;
    }
  };

  return (
    <div className="wallet-connect">
      {isConnected ? (
        <div className="wallet-info">
          <span className="wallet-address">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          {chainId && (
            <span className="network-badge">
              {getNetworkName(chainId)}
            </span>
          )}
        </div>
      ) : (
        <button className="connect-button" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;