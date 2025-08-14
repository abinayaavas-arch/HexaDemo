import React, { useState } from 'react';
import { ASSET_TYPES, ASSET_STATUSES, API_BASE_URL } from '../utils/constants';
import axios from 'axios';
import './AddAssetForm.css';

const emptyForm = {
  name: '',
  type: '',
  serialNumber: '',
  purchaseDate: '',
  assignedTo: '',
  status: '',
};

const AddAssetForm = ({ onAssetAdded }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 3 || form.name.length > 100) errs.name = 'Name must be 3 to 100 characters long';
    if (!form.type) errs.type = 'Type is required';
    if (!form.serialNumber) errs.serialNumber = 'Serial number is required';
    if (!form.purchaseDate) errs.purchaseDate = 'Purchase date is required';
    if (!form.status) errs.status = 'Status is required';
    return errs;
  };

  const handleChange = e => {
    let { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: null }));
    setApiError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      // AssignedTo only present if non-empty
      if (!payload.assignedTo) delete payload.assignedTo;
      await axios.post(`${API_BASE_URL}/assets`, payload);
      setSuccess('Asset created successfully.');
      setForm(emptyForm);
      setErrors({});
      if (onAssetAdded) onAssetAdded();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors || {});
        setApiError(err.response.data.message || 'Validation failed');
      } else if (err.response && err.response.status === 409) {
        setApiError(err.response.data.message || 'Duplicate serial number');
      } else {
        setApiError('Failed to add asset. Please try again later.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Add New Asset</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" data-testid="name-input" value={form.name} onChange={handleChange} maxLength={100}/>
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div>
          <label htmlFor="type">Type</label>
          <select id="type" name="type" data-testid="type-select" value={form.type} onChange={handleChange}>
            <option value="">Select Type</option>
            {ASSET_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.type && <span className="error">{errors.type}</span>}
        </div>
        <div>
          <label htmlFor="serialNumber">Serial Number</label>
          <input id="serialNumber" name="serialNumber" data-testid="serial-input" value={form.serialNumber} onChange={handleChange} />
          {errors.serialNumber && <span className="error">{errors.serialNumber}</span>}
        </div>
        <div>
          <label htmlFor="purchaseDate">Purchase Date</label>
          <input id="purchaseDate" name="purchaseDate" data-testid="date-input" type="date" value={form.purchaseDate} onChange={handleChange}/>
          {errors.purchaseDate && <span className="error">{errors.purchaseDate}</span>}
        </div>
        <div>
          <label htmlFor="assignedTo">Assigned To (optional)</label>
          <input id="assignedTo" name="assignedTo" data-testid="assigned-input" value={form.assignedTo} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" data-testid="status-select" value={form.status} onChange={handleChange}>
            <option value="">Select Status</option>
            {ASSET_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.status && <span className="error">{errors.status}</span>}
        </div>
        {apiError && <div className="error">{apiError}</div>}
        {success && <div className="success">{success}</div>}
        <button className="btn-primary" type="submit" data-testid="submit-button" disabled={loading}>{loading? 'Adding...' : 'Add Asset'}</button>
      </form>
    </div>
  );
};

export default AddAssetForm;
