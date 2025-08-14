import React, { useState } from 'react';
import AssetList from './components/AssetList';
import AddAssetForm from './components/AddAssetForm';
import './App.css';

function App() {
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [refreshAssets, setRefreshAssets] = useState(false);

  const handleAssetAdded = () => {
    setView('list');
    setRefreshAssets(v => !v);
  };

  return (
    <div className="main-app-wrapper">
      <header className="main-header">
        <span className="main-title">IT Asset Management System</span>
        <div className="nav-tabs">
          <button
            className={`nav-btn${view === 'list' ? ' nav-btn-active' : ''}`}
            onClick={() => setView('list')}
            data-testid="nav-assets"
          >Asset List</button>
          <button
            className={`nav-btn${view === 'add' ? ' nav-btn-active' : ''}`}
            onClick={() => setView('add')}
            data-testid="nav-add"
          >Add Asset</button>
        </div>
      </header>
      <main className="main-content">
        {view === 'list' ? (
          <AssetList key={refreshAssets ? '1' : '0'} />
        ) : (
          <AddAssetForm onAssetAdded={handleAssetAdded} />
        )}
      </main>
    </div>
  );
}

export default App;
