import React, { useState } from 'react';
import { ASSET_STATUSES, API_BASE_URL } from '../utils/constants';
import axios from 'axios';
import './UpdateAssetStatusModal.css';

const UpdateAssetStatusModal = ({ asset, onClose }) => {
  const [status, setStatus] = useState(asset.status);
  const [assignedTo, setAssignedTo] = useState(asset.assignedTo || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setSuccess('');
    if (!status) { setErr('Status is required.'); return; }
    if (status === 'ASSIGNED' && !assignedTo) { setErr('Assigned To is required when assigning.'); return; }
    setLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/assets/${asset.id}/status`, {
        status,
        assignedTo: status === 'ASSIGNED' ? assignedTo : null
      });
      setSuccess('Status updated.');
      setTimeout(() => onClose(true), 600);
    } catch(e) {
      setErr(e.response?.data?.message || 'Failed to update status.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" data-testid="modal-container">
      <div className="modal-content">
        <h3>Update Asset Status</h3>
        <p><b>Name:</b> {asset.name}</p>
        <p><b>Type:</b> {asset.type}</p>
        <p><b>Serial No:</b> {asset.serialNumber}</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="status">Status</label>
          <select name="status" id="status" data-testid="status-select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Select Status</option>
            {ASSET_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {status==='ASSIGNED' && (
            <>
              <label htmlFor="assignedTo">Assigned To</label>
              <input id="assignedTo" data-testid="assigned-input" value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} />
            </>
          )}
          {err && <div className="error">{err}</div>}
          {success && <div className="success">{success}</div>}
          <div className="btns">
            <button type="submit" className="btn-primary" disabled={loading}>{loading? 'Saving...' : 'Save'}</button>
            <button type="button" className="btn-secondary" onClick={()=>onClose(false)} disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssetStatusModal;
