import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  UploadCloud, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Archive,
  Barcode,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { adminApi } from '../api/admin.api';
import { MasterProductModal } from '../components/MasterProductModal';
import { BulkSeedModal } from '../components/BulkSeedModal';

export const MasterCatalogDesk = ({ onRefreshStats }) => {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'soft_deleted'
  
  // Master Catalog State
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [page, setPage] = useState(0);
  const limit = 30;

  // Catalog Stats
  const [stats, setStats] = useState(null);

  // Soft-Deleted State
  const [softDeleted, setSoftDeleted] = useState([]);
  const [softDeletedTotal, setSoftDeletedTotal] = useState(0);
  const [softLoading, setSoftLoading] = useState(false);
  const [softSearch, setSoftSearch] = useState('');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkSeedModalOpen, setBulkSeedModalOpen] = useState(false);

  // Confirmation Modals
  const [hardDeleteTarget, setHardDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Master Catalog Stats
  const fetchStats = async () => {
    try {
      const data = await adminApi.getMasterCatalogStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load catalog stats:', err);
    }
  };

  // Fetch Master Products
  const fetchMasterProducts = async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        offset: page * limit,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (verifiedFilter !== '') params.is_verified = verifiedFilter;

      const res = await adminApi.getMasterProducts(params);
      setProducts(res.products || []);
      setTotalProducts(res.total || 0);
    } catch (err) {
      console.error('Failed to load master products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Soft-Deleted Products
  const fetchSoftDeleted = async () => {
    try {
      setSoftLoading(true);
      const params = {
        limit: 50,
        offset: 0,
      };
      if (softSearch.trim()) params.search = softSearch.trim();

      const res = await adminApi.getSoftDeletedProducts(params);
      setSoftDeleted(res.products || []);
      setSoftDeletedTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load soft-deleted products:', err);
    } finally {
      setSoftLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchMasterProducts();
    } else {
      fetchSoftDeleted();
    }
  }, [activeTab, page, search, selectedCategory, selectedBrand, verifiedFilter]);

  // Handle Save (Add/Edit)
  const handleSaveProduct = async (payload, existingId) => {
    if (existingId) {
      await adminApi.updateMasterProduct(existingId, payload);
    } else {
      await adminApi.createMasterProduct(payload);
    }
    fetchMasterProducts();
    fetchStats();
    if (onRefreshStats) onRefreshStats();
  };

  // Handle Delete from Master Catalog
  const handleDeleteMasterProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the master catalog?`)) {
      return;
    }
    try {
      await adminApi.deleteMasterProduct(id);
      fetchMasterProducts();
      fetchStats();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  // Handle Restore Soft-Deleted Product
  const handleRestoreProduct = async (id, name, shopName) => {
    if (!window.confirm(`Restore "${name}" back into ${shopName}'s active inventory?`)) {
      return;
    }
    try {
      await adminApi.restoreProduct(id);
      fetchSoftDeleted();
      fetchStats();
      alert(`✓ Product restored to ${shopName} successfully!`);
    } catch (err) {
      alert('Failed to restore: ' + err.message);
    }
  };

  // Handle Permanent Hard-Delete
  const handleConfirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.hardDeleteProduct(hardDeleteTarget.id);
      setHardDeleteTarget(null);
      fetchSoftDeleted();
      fetchStats();
      alert('✓ Product permanently erased from database.');
    } catch (err) {
      alert('Failed to hard-delete: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Top Telemetry & KPI Cards */}
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card primary" onClick={() => setActiveTab('catalog')} style={{ cursor: 'pointer' }}>
          <div className="metric-top">
            <span className="metric-title">Master Catalog Items</span>
            <div className="metric-icon-wrap">
              <Package size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.total_products || 0}</div>
          <div className="metric-subtitle">
            {stats?.verified_products || 0} Verified & Tamper-Proof
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-top">
            <span className="metric-title">Active Brands</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Layers size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.total_brands || 0}</div>
          <div className="metric-subtitle">Across {stats?.total_categories || 0} Core Categories</div>
        </div>

        <div className="metric-card warning" onClick={() => setActiveTab('soft_deleted')} style={{ cursor: 'pointer' }}>
          <div className="metric-top">
            <span className="metric-title">Soft-Deleted Vault</span>
            <div className="metric-icon-wrap">
              <Archive size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.soft_deleted_products || 0}</div>
          <div className="metric-subtitle">Preserved Merchant Sales & Bills</div>
        </div>

        <div className="metric-card neutral">
          <div className="metric-top">
            <span className="metric-title">Universal Scan Hits</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Barcode size={20} />
            </div>
          </div>
          <div className="metric-value">{stats?.total_scans || 0}</div>
          <div className="metric-subtitle">1-Tap Merchant Ingestion Lookups</div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a2847',
        marginBottom: '20px',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab('catalog'); setPage(0); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Package size={15} />
            <span>Master Catalog & SKU Database ({totalProducts})</span>
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'soft_deleted' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab('soft_deleted'); fetchSoftDeleted(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Archive size={15} />
            <span>Soft-Deleted Products Vault ({stats?.soft_deleted_products || 0})</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {activeTab === 'catalog' && (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setBulkSeedModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              >
                <UploadCloud size={15} />
                <span>Bulk Seed Lakhs of Products</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} />
                <span>Add Master Product</span>
              </button>
            </>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={activeTab === 'catalog' ? fetchMasterProducts : fetchSoftDeleted}
            title="Refresh Table"
          >
            <RefreshCw size={14} className={loading || softLoading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* TAB 1: MASTER CATALOG */}
      {activeTab === 'catalog' && (
        <div>
          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
            background: '#0d1527',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #1a2847'
          }}>
            <div style={{ flex: '1 1 260px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by Barcode, Title, Brand, HSN..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <div style={{ width: '180px' }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
              >
                <option value="">All Categories</option>
                <option value="Groceries">Groceries & Staples</option>
                <option value="Dairy & Bakery">Dairy & Bakery</option>
                <option value="Beverages & Tea">Beverages & Tea</option>
                <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                <option value="Household & Laundry">Household & Laundry</option>
                <option value="Personal Care & Hygiene">Personal Care & Hygiene</option>
                <option value="Spices & Masala">Spices & Masala</option>
              </select>
            </div>

            <div style={{ width: '160px' }}>
              <select
                className="form-select"
                value={verifiedFilter}
                onChange={(e) => { setVerifiedFilter(e.target.value); setPage(0); }}
              >
                <option value="">Verification: All</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified</option>
              </select>
            </div>
          </div>

          {/* Catalog Data Table */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Product Title & Pack</th>
                  <th>Barcode / SKU</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>MRP</th>
                  <th>Suggested</th>
                  <th>Tax & HSN</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                      <div>Loading universal master catalog...</div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <Package size={36} style={{ margin: '0 auto 10px', color: '#334155' }} />
                      <div style={{ fontWeight: 600, color: '#94a3b8' }}>No Master Products Found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        Use "Bulk Seed" or "Add Master Product" to start building your internal database.
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: '#090f1d',
                          border: '1px solid #1a2847',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <Package size={18} style={{ color: '#475569' }} />
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.88rem' }}>
                          {p.name}
                        </div>
                        {p.unit && (
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            Pack: {p.unit}
                          </span>
                        )}
                      </td>

                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          background: '#0a1020',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          border: '1px solid #1a2847',
                          color: '#38bdf8',
                          fontSize: '0.82rem'
                        }}>
                          {p.barcode}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 500, color: '#cbd5e1' }}>
                          {p.brand || '—'}
                        </span>
                      </td>

                      <td>
                        <span className="sidebar-badge" style={{ background: '#1e293b', color: '#cbd5e1' }}>
                          {p.category}
                        </span>
                      </td>

                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {p.mrp > 0 ? `₹${p.mrp.toFixed(0)}` : '—'}
                      </td>

                      <td style={{ color: '#34d399', fontWeight: 600 }}>
                        {p.selling_price > 0 ? `₹${p.selling_price.toFixed(0)}` : '—'}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                          GST: <strong style={{ color: '#cbd5e1' }}>{p.gst_rate}%</strong>
                        </div>
                        {p.hsn_code && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            HSN: {p.hsn_code}
                          </div>
                        )}
                      </td>

                      <td>
                        {p.is_verified ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}>
                            <ShieldCheck size={12} />
                            Verified
                          </span>
                        ) : (
                          <span style={{
                            background: '#1e293b',
                            color: '#94a3b8',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem'
                          }}>
                            Standard
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '5px 9px', fontSize: '0.78rem' }}
                            onClick={() => { setEditingProduct(p); setProductModalOpen(true); }}
                            title="Edit Master Product"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '5px 9px', fontSize: '0.78rem' }}
                            onClick={() => handleDeleteMasterProduct(p.id, p.name)}
                            title="Remove from Master Catalog"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalProducts > limit && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              padding: '12px 16px',
              background: '#0d1527',
              borderRadius: '8px',
              border: '1px solid #1a2847'
            }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Showing <strong>{page * limit + 1}</strong> to <strong>{Math.min((page + 1) * limit, totalProducts)}</strong> of <strong>{totalProducts}</strong> products
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={(page + 1) * limit >= totalProducts}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SOFT-DELETED VAULT (Audit & Recovery) */}
      {activeTab === 'soft_deleted' && (
        <div>
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fbbf24',
            fontSize: '0.86rem'
          }}>
            <Archive size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Accidental Data Loss Shield Active:</strong> Products deleted by merchants are archived with <code>deleted_at</code> timestamps. Past sales receipts, POS orders, and Khata ledgers remain 100% intact. As Super Admin, you can restore items or permanently hard-delete them.
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '16px', position: 'relative', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by Product Name, Shop Name, or SKU..."
              value={softSearch}
              onChange={(e) => setSoftSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Soft-Deleted Data Table */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Store / Merchant</th>
                  <th>Product Name</th>
                  <th>Barcode / SKU</th>
                  <th>Selling Price</th>
                  <th>Cost Price</th>
                  <th>Stock at Deletion</th>
                  <th>Deleted At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {softLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                      <div>Querying soft-deleted inventory archive...</div>
                    </td>
                  </tr>
                ) : softDeleted.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <CheckCircle2 size={36} style={{ margin: '0 auto 10px', color: '#10b981' }} />
                      <div style={{ fontWeight: 600, color: '#94a3b8' }}>No Soft-Deleted Products Found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                        All merchant product catalogs are active and clean.
                      </div>
                    </td>
                  </tr>
                ) : (
                  softDeleted.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {item.shop_name}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                          {item.name}
                        </span>
                      </td>

                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          background: '#0a1020',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          border: '1px solid #1a2847',
                          color: '#38bdf8',
                          fontSize: '0.8rem'
                        }}>
                          {item.sku || '—'}
                        </span>
                      </td>

                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                        ₹{item.price}
                      </td>

                      <td style={{ color: '#94a3b8' }}>
                        {item.cost_price > 0 ? `₹${item.cost_price}` : '—'}
                      </td>

                      <td>
                        <span className="sidebar-badge" style={{ background: '#334155', color: '#cbd5e1' }}>
                          {item.stock} units
                        </span>
                      </td>

                      <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {new Date(item.deleted_at).toLocaleString()}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '5px 10px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                            onClick={() => handleRestoreProduct(item.id, item.name, item.shop_name)}
                            title="Restore Product to Merchant Store"
                          >
                            <RotateCcw size={13} style={{ marginRight: '4px' }} />
                            <span>Restore</span>
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '5px 10px' }}
                            onClick={() => setHardDeleteTarget(item)}
                            title="Permanent Hard-Delete (Admin Only)"
                          >
                            <Trash2 size={13} style={{ marginRight: '4px' }} />
                            <span>Hard Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <MasterProductModal
        isOpen={productModalOpen}
        product={editingProduct}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Bulk Seeding Modal */}
      <BulkSeedModal
        isOpen={bulkSeedModalOpen}
        onClose={() => setBulkSeedModalOpen(false)}
        onSuccess={() => {
          fetchMasterProducts();
          fetchStats();
        }}
      />

      {/* Permanent Hard-Delete Confirmation Modal */}
      {hardDeleteTarget && (
        <div className="modal-overlay" onClick={() => setHardDeleteTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="brand-icon" style={{ background: '#ef4444' }}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#f87171' }}>Permanent Hard-Delete</h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Admin Irreversible Action</p>
                </div>
              </div>
              <button className="btn-logout" onClick={() => setHardDeleteTarget(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.84rem',
                color: '#fca5a5'
              }}>
                <strong>Danger:</strong> This will permanently delete <strong>{hardDeleteTarget.name}</strong> from store <strong>{hardDeleteTarget.shop_name}</strong> and remove its inventory record. This cannot be undone.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setHardDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmHardDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting Permanently...' : 'Confirm Hard-Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
