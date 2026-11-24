import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ListFilter 
} from 'lucide-react';
import { adminApi } from '../api/admin.api';

// Curated Top Indian FMCG Essentials for 1-Click Launch Seeding
const FMCG_PRESETS = [
  {
    barcode: "8901030383709",
    name: "Surf Excel Quick Wash Detergent Powder 1kg",
    brand: "Surf Excel",
    category: "Household & Laundry",
    unit: "1kg",
    mrp: 140.0,
    selling_price: 130.0,
    hsn_code: "3402",
    gst_rate: 18.0,
    description: "Superior stain removal with quick wash technology",
    image_url: "https://images.shopsilo.in/products/surf-excel-1kg.png"
  },
  {
    barcode: "8901063012485",
    name: "Britannia Good Day Butter Cookies 200g",
    brand: "Britannia",
    category: "Snacks & Confectionery",
    unit: "200g",
    mrp: 35.0,
    selling_price: 32.0,
    hsn_code: "1905",
    gst_rate: 18.0,
    description: "Rich butter cookies with delightful aroma",
    image_url: "https://images.shopsilo.in/products/good-day-butter.png"
  },
  {
    barcode: "8901030775269",
    name: "Tata Tea Gold Leaf & Dust Tea 500g",
    brand: "Tata Tea",
    category: "Beverages & Tea",
    unit: "500g",
    mrp: 310.0,
    selling_price: 285.0,
    hsn_code: "0902",
    gst_rate: 5.0,
    description: "Exquisite tea with gently rolled aromatic long leaves",
    image_url: "https://images.shopsilo.in/products/tata-tea-gold-500g.png"
  },
  {
    barcode: "8901725132200",
    name: "Maggi 2-Minute Instant Noodles 70g",
    brand: "Nestle",
    category: "Snacks & Confectionery",
    unit: "70g",
    mrp: 14.0,
    selling_price: 13.0,
    hsn_code: "1902",
    gst_rate: 12.0,
    description: "Classic masala noodles with tastemaker",
    image_url: "https://images.shopsilo.in/products/maggi-70g.png"
  },
  {
    barcode: "8901262010054",
    name: "Amul Pure Ghee 1L Tin",
    brand: "Amul",
    category: "Dairy & Bakery",
    unit: "1L",
    mrp: 650.0,
    selling_price: 615.0,
    hsn_code: "0405",
    gst_rate: 12.0,
    description: "Traditional pure cow ghee with rich granular texture",
    image_url: "https://images.shopsilo.in/products/amul-ghee-1l.png"
  },
  {
    barcode: "8901725181222",
    name: "Aashirvaad Superior MP Shudh Chakki Atta 5kg",
    brand: "Aashirvaad",
    category: "Groceries",
    unit: "5kg",
    mrp: 260.0,
    selling_price: 245.0,
    hsn_code: "1101",
    gst_rate: 5.0,
    description: "100% whole wheat flour grounded with traditional stone chakki",
    image_url: "https://images.shopsilo.in/products/aashirvaad-atta-5kg.png"
  },
  {
    barcode: "8901314010520",
    name: "Colgate Strong Teeth Dental Cream 150g",
    brand: "Colgate",
    category: "Personal Care & Hygiene",
    unit: "150g",
    mrp: 110.0,
    selling_price: 99.0,
    hsn_code: "3306",
    gst_rate: 18.0,
    description: "Calcium and active fluoride toothpaste for strong cavity protection",
    image_url: "https://images.shopsilo.in/products/colgate-strong-teeth-150g.png"
  },
  {
    barcode: "8906007280014",
    name: "Fortune Sunlite Refined Sunflower Oil 1L Pouch",
    brand: "Fortune",
    category: "Groceries",
    unit: "1L",
    mrp: 145.0,
    selling_price: 135.0,
    hsn_code: "1512",
    gst_rate: 5.0,
    description: "Enriched with Vitamins A & D for healthy heart",
    image_url: "https://images.shopsilo.in/products/fortune-sunflower-1l.png"
  },
  {
    barcode: "8901030005052",
    name: "Lifebuoy Total 10 Germ Protection Soap 125g",
    brand: "Lifebuoy",
    category: "Personal Care & Hygiene",
    unit: "125g",
    mrp: 38.0,
    selling_price: 35.0,
    hsn_code: "3401",
    gst_rate: 18.0,
    description: "Advanced silver shield formula for 99.9% germ protection",
    image_url: "https://images.shopsilo.in/products/lifebuoy-total-125g.png"
  },
  {
    barcode: "8901719101014",
    name: "Parle-G Original Gluco Biscuits 800g Super Saver",
    brand: "Parle",
    category: "Snacks & Confectionery",
    unit: "800g",
    mrp: 80.0,
    selling_price: 75.0,
    hsn_code: "1905",
    gst_rate: 18.0,
    description: "The world's largest selling glucose biscuit packed with milk and wheat",
    image_url: "https://images.shopsilo.in/products/parle-g-800g.png"
  }
];

export const BulkSeedModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeMode, setActiveMode] = useState('preset'); // 'preset' | 'csv' | 'json'
  const [jsonText, setJsonText] = useState('');
  const [csvPreview, setCsvPreview] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle CSV file selection and client-side parse
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setError('CSV file must have a header row and at least 1 product row.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
        const products = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length < 2) continue;

          const row = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] || '';
          });

          // Standardize expected fields
          products.push({
            barcode: row.barcode || row.sku || '',
            name: row.name || row.title || '',
            brand: row.brand || '',
            category: row.category || 'Groceries',
            unit: row.unit || row.pack_size || 'pcs',
            mrp: parseFloat(row.mrp) || 0,
            selling_price: parseFloat(row.selling_price || row.price) || 0,
            hsn_code: row.hsn_code || row.hsn || '',
            gst_rate: parseFloat(row.gst_rate || row.gst) || 5,
            description: row.description || '',
            image_url: row.image_url || row.image || '',
          });
        }

        setCsvPreview(products);
      } catch (err) {
        setError('Failed to parse CSV: ' + err.message);
      }
    };

    reader.readAsText(file);
  };

  // Download Sample CSV Template
  const handleDownloadSample = () => {
    const sampleContent = 
`barcode,name,brand,category,unit,mrp,selling_price,hsn_code,gst_rate,description,image_url
8901030383709,Surf Excel Quick Wash 1kg,Surf Excel,Household & Laundry,1kg,140,130,3402,18,Quick wash technology,https://images.shopsilo.in/products/surf-excel.png
8901262010054,Amul Pure Cow Ghee 1L,Amul,Dairy & Bakery,1L,650,615,0405,12,Pure cow ghee,https://images.shopsilo.in/products/amul-ghee.png
8901063012485,Britannia Good Day Butter 200g,Britannia,Snacks,200g,35,32,1905,18,Rich butter cookies,https://images.shopsilo.in/products/good-day.png`;

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shopsilo_master_catalog_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteSeed = async () => {
    let payload = [];
    setError('');
    setResult(null);

    if (activeMode === 'preset') {
      payload = FMCG_PRESETS;
    } else if (activeMode === 'csv') {
      if (csvPreview.length === 0) {
        setError('Please select a valid CSV file first.');
        return;
      }
      payload = csvPreview;
    } else if (activeMode === 'json') {
      if (!jsonText.trim()) {
        setError('Please paste JSON array of products.');
        return;
      }
      try {
        const parsed = JSON.parse(jsonText);
        if (!Array.isArray(parsed)) {
          setError('JSON must be an array of product objects: [{ ... }]');
          return;
        }
        payload = parsed;
      } catch (err) {
        setError('Invalid JSON syntax: ' + err.message);
        return;
      }
    }

    if (payload.length === 0) {
      setError('No products found to seed.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.bulkSeedMasterCatalog(payload);
      setResult(res);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Bulk seeding failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '780px', width: '94%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>High-Speed Master Catalog Bulk Seeder</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Seed lakhs of verified products into ShopSilo's internal catalog
              </p>
            </div>
          </div>
          <button className="btn-logout" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeMode === 'preset' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveMode('preset')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>1-Click FMCG Starter Presets ({FMCG_PRESETS.length})</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeMode === 'csv' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveMode('csv')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={14} />
              <span>Upload CSV File</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeMode === 'json' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveMode('json')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Paste JSON Array</span>
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
              color: '#f87171',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '16px',
              color: '#34d399'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} />
                <span>Bulk Seeding Completed Successfully!</span>
              </div>
              <div style={{ fontSize: '0.84rem', marginTop: '6px', color: '#cbd5e1' }}>
                Total Processed: <strong>{result.total_processed}</strong> • Inserted: <strong>{result.inserted}</strong> • Updated: <strong>{result.updated}</strong>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#f87171' }}>
                  {result.errors.length} item(s) had warnings or were skipped.
                </div>
              )}
            </div>
          )}

          {/* Mode A: Presets */}
          {activeMode === 'preset' && (
            <div>
              <div style={{
                background: '#0a1020',
                border: '1px solid #1a2847',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                color: '#94a3b8'
              }}>
                Pre-load top Indian FMCG household essentials (Surf Excel, Tata Tea, Amul Ghee, Maggi, Britannia, Aashirvaad Atta, Fortune Oil) directly with verified barcodes, HSN codes, and images.
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #1a2847', borderRadius: '8px' }}>
                <table className="admin-table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Barcode</th>
                      <th>Product</th>
                      <th>Brand</th>
                      <th>MRP</th>
                      <th>GST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FMCG_PRESETS.map((p) => (
                      <tr key={p.barcode}>
                        <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{p.barcode}</td>
                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{p.name}</td>
                        <td>{p.brand}</td>
                        <td>₹{p.mrp}</td>
                        <td>{p.gst_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mode B: CSV Upload */}
          {activeMode === 'csv' && (
            <div>
              <div style={{
                border: '2px dashed #293d6b',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                background: '#090f1d',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
              onClick={() => document.getElementById('csvFileInput').click()}
              >
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <UploadCloud size={36} style={{ color: '#3b82f6', margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {selectedFileName ? selectedFileName : 'Click to select or drop CSV file'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  Supports up to 50,000 product rows in a single batch
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleDownloadSample}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={13} />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>

              {csvPreview.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1' }}>
                    Preview ({csvPreview.length} items parsed from file):
                  </div>
                  <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #1a2847', borderRadius: '8px' }}>
                    <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Barcode</th>
                          <th>Product Name</th>
                          <th>Brand</th>
                          <th>MRP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 10).map((p, idx) => (
                          <tr key={idx}>
                            <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{p.barcode}</td>
                            <td>{p.name}</td>
                            <td>{p.brand}</td>
                            <td>₹{p.mrp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length > 10 && (
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
                      Showing first 10 of {csvPreview.length} products. All {csvPreview.length} will be ingested.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode C: JSON */}
          {activeMode === 'json' && (
            <div>
              <div className="form-group">
                <label className="form-label">Paste Product JSON Array</label>
                <textarea
                  className="form-input"
                  rows="9"
                  placeholder='[ { "barcode": "890123456789", "name": "Basmati Rice 5kg", "brand": "Fortune", "mrp": 450, "gst_rate": 5 } ]'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleExecuteSeed} 
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting ? 'Ingesting Batch...' : 'Ingest Products to Master Catalog'}
          </button>
        </div>
      </div>
    </div>
  );
};
