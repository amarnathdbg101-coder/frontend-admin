import React, { useState, useEffect } from 'react';
import { X, PackageCheck, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';

export const MasterProductModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    brand: '',
    category: 'Groceries',
    unit: 'pcs',
    mrp: '',
    selling_price: '',
    hsn_code: '',
    gst_rate: '5',
    image_url: '',
    description: '',
    trust_score: 100,
    is_verified: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode || '',
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || 'Groceries',
        unit: product.unit || 'pcs',
        mrp: product.mrp !== undefined ? product.mrp : '',
        selling_price: product.selling_price !== undefined ? product.selling_price : '',
        hsn_code: product.hsn_code || '',
        gst_rate: product.gst_rate !== undefined ? product.gst_rate.toString() : '5',
        image_url: product.image_url || '',
        description: product.description || '',
        trust_score: product.trust_score !== undefined ? product.trust_score : 100,
        is_verified: product.is_verified !== undefined ? product.is_verified : true,
      });
    } else {
      setFormData({
        barcode: '',
        name: '',
        brand: '',
        category: 'Groceries',
        unit: 'pcs',
        mrp: '',
        selling_price: '',
        hsn_code: '',
        gst_rate: '5',
        image_url: '',
        description: '',
        trust_score: 100,
        is_verified: true,
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen || !product?.id) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.barcode.trim()) {
      setError('Barcode / SKU is required.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Product Name is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        barcode: formData.barcode.trim(),
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        unit: formData.unit.trim(),
        mrp: parseFloat(formData.mrp) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        hsn_code: formData.hsn_code.trim(),
        gst_rate: parseFloat(formData.gst_rate) || 0,
        image_url: formData.image_url.trim(),
        description: formData.description.trim(),
        trust_score: parseInt(formData.trust_score, 10) || 100,
        is_verified: Boolean(formData.is_verified),
      };

      await onSave(payload, product?.id);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(product && product.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon">
              <PackageCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>
                Edit Master Product
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Curate verified catalog details for merchant auto-fill
              </p>
            </div>
          </div>
          <button className="btn-logout" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Barcode / SKU *</label>
                <input
                  type="text"
                  name="barcode"
                  className="form-input"
                  placeholder="e.g. 8901030383709"
                  value={formData.barcode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  name="brand"
                  className="form-input"
                  placeholder="e.g. Surf Excel, Tata, Amul"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Name / Title *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Surf Excel Quick Wash Detergent Powder 1kg"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Groceries">Groceries & Staples</option>
                  <option value="Dairy & Bakery">Dairy & Bakery</option>
                  <option value="Beverages & Tea">Beverages & Tea</option>
                  <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                  <option value="Household & Laundry">Household & Laundry</option>
                  <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
                  <option value="Spices & Masala">Spices & Masala</option>
                  <option value="General Store">General Store</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit / Pack Size</label>
                <input
                  type="text"
                  name="unit"
                  className="form-input"
                  placeholder="e.g. 1kg, 500g, 1L, pcs"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="mrp"
                  className="form-input"
                  placeholder="e.g. 140"
                  value={formData.mrp}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Suggested Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="selling_price"
                  className="form-input"
                  placeholder="e.g. 130"
                  value={formData.selling_price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">HSN Code</label>
                <input
                  type="text"
                  name="hsn_code"
                  className="form-input"
                  placeholder="e.g. 3402, 1905, 0402"
                  value={formData.hsn_code}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Rate (%)</label>
                <select
                  name="gst_rate"
                  className="form-select"
                  value={formData.gst_rate}
                  onChange={handleChange}
                >
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5% (Essential Grocery/Food)</option>
                  <option value="12">12% (Standard Processed)</option>
                  <option value="18">18% (Household & Detergents)</option>
                  <option value="28">28% (Luxury / Aerated)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Image URL</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="url"
                  name="image_url"
                  className="form-input"
                  placeholder="https://images.shopsilo.in/..."
                  value={formData.image_url}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                {formData.image_url && (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    border: '1px solid #1a2847',
                    overflow: 'hidden',
                    background: '#090f1d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Pack Details</label>
              <textarea
                name="description"
                className="form-input"
                rows="2"
                placeholder="Product attributes, pack volume, ingredients..."
                value={formData.description}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: '#0a1020',
              borderRadius: '8px',
              border: '1px solid #1a2847',
              marginTop: '12px'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc' }}>
                  ShopSilo Verified Badge
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Mark this product as official & tamper-proof in all merchant scans
                </div>
              </div>
              <input
                type="checkbox"
                name="is_verified"
                checked={formData.is_verified}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update Master Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
