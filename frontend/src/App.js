import React from 'react';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import FileGallery from './components/FileGallery';
import './styles/web3-styles.css';

function App() {
  return (
    <Layout>
      <div className="app-content">
        <FileUpload />
        <FileGallery />
      </div>
    </Layout>
  );
}

export default App;