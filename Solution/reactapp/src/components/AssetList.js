import React, { useState, useEffect } from 'react';
import UpdateAssetStatusModal from './UpdateAssetStatusModal';
import { ASSET_TYPES, ASSET_STATUSES, API_BASE_URL } from '../utils/constants';
import axios from 'axios';
import './AssetList.css';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/assets`;
      const params = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const resp = await axios.get(url, { params });
      setAssets(resp.data);
    } catch (e) {
      setError('Could not load assets.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line
  }, [filterType, filterStatus]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredAssets(assets);
    } else {
      setFilteredAssets(
        assets.filter(a =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.serialNumber.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [assets, search]);

  const openModal = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };
  
  const closeModal = (refresh = false) => {
    setShowModal(false);
    setSelectedAsset(null);
    if (refresh) fetchAssets();
  };

  return (
    <div className="asset-list-container">
      <h2>Asset List</h2>
      <div className="controls">
        <select data-testid="type-filter" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {ASSET_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select data-testid="status-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {ASSET_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <input
          data-testid="search-input"
          type="search"
          placeholder="Search by Name or Serial Number"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {loading && <div className="empty-state">Loading assets...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
        <table className="asset-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Serial Number</th>
              <th>Purchase Date</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr><td colSpan="7" className="empty-state">No assets found.</td></tr>
            ) : (
              filteredAssets.map(asset => (
                <tr key={asset.id} data-testid={`asset-row-${asset.id}`}>
                  <td>{asset.name}</td>
                  <td>{asset.type}</td>
                  <td>{asset.serialNumber}</td>
                  <td>{asset.purchaseDate}</td>
                  <td>{asset.assignedTo || '-'}</td>
                  <td>{asset.status}</td>
                  <td>
                    <button className="btn-secondary" onClick={()=>openModal(asset)} data-testid={`update-button-${asset.id}`}>Update Status</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {showModal && selectedAsset && <UpdateAssetStatusModal asset={selectedAsset} onClose={closeModal} />}
    </div>
  );
};

export default AssetList;
