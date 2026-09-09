import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  useOrders, useProducts, useCategories, useCoupons, useUpdateOrderStatus,
  useAdminUsers, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCreateCoupon, useUpdateCoupon, useDeleteCoupon,
  type Product, type Category, type Coupon,
} from '@/api/storeApi';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/api';
import {
  BarChart3, Package, Users, Ticket, FolderKanban, ArrowLeft, Plus,
  DollarSign, ShoppingBag, Trash2, Pencil, X, Check, TrendingUp,
  Star, ToggleLeft, ToggleRight, ShieldCheck,
} from 'lucide-react';

// ─── Reusable Modal ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-panel">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Field Helpers ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";
const btnPrimary = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center gap-1.5";
const btnDanger  = "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center gap-1.5";
const btnGhost   = "px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all";

// ─── Status colours ────────────────────────────────────────────────────────────
const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border border-gray-200',
};
const PAY_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  failed: 'bg-rose-50 text-rose-700 border border-rose-200',
};

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'coupons' | 'users';

// ─── Products CRUD ─────────────────────────────────────────────────────────────
function ProductsTab({ productsData, productsLoading }: { productsData: any; productsLoading: boolean }) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { data: categories } = useCategories();

  const [modal, setModal] = useState<null | 'create' | Product>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', compare_price: '', stock: '', category_id: '', is_active: true, is_featured: false });
  const imageRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', compare_price: '', stock: '', category_id: '', is_active: true, is_featured: false });
    setModal('create');
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description, price: p.price,
      compare_price: p.compare_price ?? '', stock: String(p.stock),
      category_id: String(p.category?.id ?? ''), is_active: p.is_active, is_featured: p.is_featured,
    });
    setModal(p);
  };

  const handleSubmit = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (imageRef.current?.files?.[0]) fd.append('image', imageRef.current.files[0]);

    if (modal === 'create') {
      createProduct.mutate(fd, {
        onSuccess: () => { toast.success('Product created!'); setModal(null); },
        onError:   (e: any) => toast.error(e?.response?.data?.detail || 'Failed to create product'),
      });
    } else {
      updateProduct.mutate({ id: (modal as Product).id, data: fd }, {
        onSuccess: () => { toast.success('Product updated!'); setModal(null); },
        onError:   (e: any) => toast.error(e?.response?.data?.detail || 'Failed to update product'),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteProduct.mutate(deleteId, {
      onSuccess: () => { toast.success('Product deleted'); setDeleteId(null); },
      onError:   () => toast.error('Failed to delete product'),
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Products <span className="text-gray-400 font-normal text-sm">({productsData?.count ?? 0})</span></h2>
          <button onClick={openCreate} className={btnPrimary}><Plus className="w-4 h-4" />Add Product</button>
        </div>

        {productsLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : !productsData?.results?.length ? (
          <div className="p-8"><EmptyState icon={Package} title="No products" description="Add your first product." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Featured</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsData.results.map((p: Product) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors animate-fade-in">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 img-zoom">
                          <img src={getImageUrl(p.images?.[0]?.image || '')} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-gray-900 max-w-[200px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">${parseFloat(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock > 5 ? 'bg-emerald-50 text-emerald-700' : p.stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-rose-50 text-rose-700'}`}>
                        {p.stock > 0 ? `${p.stock} left` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${p.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.is_featured ? <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modal !== null && (
        <Modal title={modal === 'create' ? 'Add New Product' : `Edit: ${(modal as Product).name}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Product Name *">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Wireless Headphones Pro" />
            </Field>
            <Field label="Description *">
              <textarea className={inputCls} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price ($) *">
                <input className={inputCls} type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </Field>
              <Field label="Compare Price ($)">
                <input className={inputCls} type="number" step="0.01" value={form.compare_price} onChange={e => setForm(f => ({ ...f, compare_price: e.target.value }))} placeholder="0.00" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stock Quantity *">
                <input className={inputCls} type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
              </Field>
              <Field label="Category *">
                <select className={inputCls} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">Select category...</option>
                  {categories?.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Product Image">
              <input ref={imageRef} type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </Field>
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-600" />
                Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
                Featured
              </label>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending} className={btnPrimary}>
                {(createProduct.isPending || updateProduct.isPending) ? 'Saving...' : <><Check className="w-4 h-4" />{modal === 'create' ? 'Create Product' : 'Save Changes'}</>}
              </button>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <Modal title="Delete Product?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-5">This action cannot be undone. The product and all its images will be permanently removed.</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={deleteProduct.isPending} className={btnDanger}>
              <Trash2 className="w-4 h-4" />{deleteProduct.isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button onClick={() => setDeleteId(null)} className={btnGhost}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Categories CRUD ───────────────────────────────────────────────────────────
function CategoriesTab({ categories, categoriesLoading }: { categories: Category[] | undefined; categoriesLoading: boolean }) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [modal, setModal] = useState<null | 'create' | Category>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });

  const openCreate = () => { setForm({ name: '', description: '', is_active: true }); setModal('create'); };
  const openEdit = (c: Category) => { setForm({ name: c.name, description: c.description, is_active: c.is_active }); setModal(c); };

  const handleSubmit = () => {
    const fn = modal === 'create' ? createCategory : updateCategory;
    const args = modal === 'create' ? form : { id: (modal as Category).id, data: form };
    (fn.mutate as any)(args, {
      onSuccess: () => { toast.success(modal === 'create' ? 'Category created!' : 'Category updated!'); setModal(null); },
      onError:   (e: any) => toast.error(e?.response?.data?.name?.[0] || 'Failed to save category'),
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Categories <span className="text-gray-400 font-normal text-sm">({categories?.length ?? 0})</span></h2>
          <button onClick={openCreate} className={btnPrimary}><Plus className="w-4 h-4" />Add Category</button>
        </div>

        {categoriesLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : !categories?.length ? (
          <div className="p-8"><EmptyState icon={FolderKanban} title="No categories" description="Add your first category." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold">Products</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((c: Category) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors animate-fade-in">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                          {c.image ? <img src={getImageUrl(c.image)} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                            : <FolderKanban className="w-4 h-4 text-blue-500" />}
                        </div>
                        <span className="font-semibold text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3 text-gray-600">{c.product_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${c.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'create' ? 'Add Category' : `Edit: ${(modal as Category).name}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Field label="Category Name *"><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Electronics" /></Field>
            <Field label="Description"><textarea className={inputCls} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..." /></Field>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-600" /> Active
            </label>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={handleSubmit} disabled={createCategory.isPending || updateCategory.isPending} className={btnPrimary}>
                <Check className="w-4 h-4" />{modal === 'create' ? 'Create' : 'Save Changes'}
              </button>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId !== null && (
        <Modal title="Delete Category?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-5">This will also affect all products in this category. This cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={() => deleteCategory.mutate(deleteId, { onSuccess: () => { toast.success('Category deleted'); setDeleteId(null); }, onError: () => toast.error('Failed — category may have products') })} className={btnDanger}>
              <Trash2 className="w-4 h-4" />Delete
            </button>
            <button onClick={() => setDeleteId(null)} className={btnGhost}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Coupons CRUD ──────────────────────────────────────────────────────────────
function CouponsTab({ coupons, couponsLoading }: { coupons: Coupon[] | undefined; couponsLoading: boolean }) {
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const blank = { code: '', description: '', discount_type: 'percentage' as 'percentage' | 'fixed', discount_value: '', valid_from: '', valid_to: '', is_active: true, usage_limit: '', minimum_order_amount: '' };
  const [modal, setModal] = useState<null | 'create' | Coupon>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(blank);

  const openCreate = () => { setForm(blank); setModal('create'); };
  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code, description: c.description, discount_type: c.discount_type,
      discount_value: c.discount_value, valid_from: c.valid_from?.slice(0, 16) ?? '',
      valid_to: c.valid_to?.slice(0, 16) ?? '', is_active: c.is_active,
      usage_limit: c.usage_limit !== null ? String(c.usage_limit) : '',
      minimum_order_amount: c.minimum_order_amount ?? '',
    });
    setModal(c);
  };

  const handleSubmit = () => {
    const payload: any = { ...form };
    if (!payload.usage_limit) delete payload.usage_limit;
    if (modal === 'create') {
      createCoupon.mutate(payload, {
        onSuccess: () => { toast.success('Coupon created!'); setModal(null); },
        onError: (e: any) => toast.error(e?.response?.data?.code?.[0] || 'Failed to create coupon'),
      });
    } else {
      updateCoupon.mutate({ id: (modal as Coupon).id, data: payload }, {
        onSuccess: () => { toast.success('Coupon updated!'); setModal(null); },
        onError: () => toast.error('Failed to update coupon'),
      });
    }
  };

  const toggleActive = (c: Coupon) => {
    updateCoupon.mutate({ id: c.id, data: { is_active: !c.is_active } as any }, {
      onSuccess: () => toast.success(`Coupon ${c.is_active ? 'deactivated' : 'activated'}`),
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Coupons <span className="text-gray-400 font-normal text-sm">({coupons?.length ?? 0})</span></h2>
          <button onClick={openCreate} className={btnPrimary}><Plus className="w-4 h-4" />Create Coupon</button>
        </div>

        {couponsLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : !coupons?.length ? (
          <div className="p-8"><EmptyState icon={Ticket} title="No coupons" description="Create your first discount coupon." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Valid To</th>
                  <th className="px-4 py-3 text-left font-semibold">Min Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c: Coupon) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors animate-fade-in">
                    <td className="px-6 py-3">
                      <div>
                        <p className="font-bold text-gray-900 font-mono">{c.code}</p>
                        {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{c.discount_type}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.valid_to).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500">${c.minimum_order_amount}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)} className="flex items-center gap-1.5 group">
                        {c.is_active
                          ? <ToggleRight className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                          : <ToggleLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />}
                        <span className={`text-xs font-semibold ${c.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'create' ? 'Create Coupon' : `Edit: ${(modal as Coupon).code}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Coupon Code *"><input className={`${inputCls} font-mono uppercase`} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" /></Field>
              <Field label="Discount Type *">
                <select className={inputCls} value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={form.discount_type === 'percentage' ? 'Discount % *' : 'Discount Amount ($) *'}>
                <input className={inputCls} type="number" step="0.01" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} placeholder={form.discount_type === 'percentage' ? '10' : '5.00'} />
              </Field>
              <Field label="Min. Order Amount ($)">
                <input className={inputCls} type="number" step="0.01" value={form.minimum_order_amount} onChange={e => setForm(f => ({ ...f, minimum_order_amount: e.target.value }))} placeholder="0.00" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valid From *"><input className={inputCls} type="datetime-local" value={form.valid_from} onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))} /></Field>
              <Field label="Valid To *"><input className={inputCls} type="datetime-local" value={form.valid_to} onChange={e => setForm(f => ({ ...f, valid_to: e.target.value }))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Usage Limit (blank = unlimited)"><input className={inputCls} type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} placeholder="Unlimited" /></Field>
              <Field label="Description"><input className={inputCls} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional note" /></Field>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-blue-600" /> Active
            </label>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button onClick={handleSubmit} disabled={createCoupon.isPending || updateCoupon.isPending} className={btnPrimary}>
                <Check className="w-4 h-4" />{modal === 'create' ? 'Create Coupon' : 'Save Changes'}
              </button>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId !== null && (
        <Modal title="Delete Coupon?" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-gray-600 mb-5">This coupon will be permanently deleted.</p>
          <div className="flex gap-2">
            <button onClick={() => deleteCoupon.mutate(deleteId, { onSuccess: () => { toast.success('Coupon deleted'); setDeleteId(null); }, onError: () => toast.error('Failed') })} className={btnDanger}><Trash2 className="w-4 h-4" />Delete</button>
            <button onClick={() => setDeleteId(null)} className={btnGhost}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Registered Users <span className="text-gray-400 font-normal text-sm">({users?.length ?? '...'})</span></h2>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : !users?.length ? (
        <div className="p-8"><EmptyState icon={Users} title="No users yet" description="Registered users will appear here." /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Username</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u: any) => {
                const initials = ((u.first_name?.[0] || '') + (u.last_name?.[0] || '') || u.username?.[0] || '?').toUpperCase();
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors animate-fade-in">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <span className="font-semibold text-gray-900">{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">@{u.username}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.is_staff
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"><ShieldCheck className="w-3 h-3" />Admin</span>
                        : <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">Customer</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: coupons, isLoading: couponsLoading } = useCoupons();
  const updateOrderStatus = useUpdateOrderStatus();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const revenue = orders ? orders.reduce((s: number, o: any) => s + parseFloat(o.total_amount || 0), 0).toFixed(2) : null;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'dashboard',   label: 'Dashboard',   icon: BarChart3 },
    { key: 'orders',      label: 'Orders',      icon: ShoppingBag },
    { key: 'products',    label: 'Products',    icon: Package },
    { key: 'categories',  label: 'Categories',  icon: FolderKanban },
    { key: 'coupons',     label: 'Coupons',     icon: Ticket },
    { key: 'users',       label: 'Users',       icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your store operations</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto animate-fade-in">
          <nav className="flex gap-1 min-w-max">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative border-b-2 ${
                  activeTab === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Dashboard Overview ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 page-enter">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
              {[
                { label: 'Total Revenue', value: revenue ? `$${revenue}` : '—', icon: DollarSign, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                { label: 'Total Orders',  value: orders?.length ?? '—',         icon: ShoppingBag, color: 'from-blue-500 to-blue-600',   bg: 'bg-blue-50',   text: 'text-blue-600' },
                { label: 'Products',      value: productsData?.count ?? '—',    icon: Package,     color: 'from-purple-500 to-violet-600',bg: 'bg-purple-50', text: 'text-purple-600' },
                { label: 'Active Coupons',value: coupons?.filter((c: any) => c.is_active).length ?? '—', icon: Ticket, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
              ].map(({ label, value, icon: Icon, bg, text }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs card-hover animate-slide-up">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                    </div>
                    <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${text}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-emerald-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Live data</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden animate-slide-up">
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">View All →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Order</th>
                      <th className="px-4 py-3 text-left font-semibold">Customer</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Total</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordersLoading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
                    ) : orders?.slice(0, 6).map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-bold text-blue-600">#{o.id}</td>
                        <td className="px-4 py-3 text-gray-700">{o.first_name} {o.last_name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[o.order_status?.toLowerCase()] || ORDER_STATUS_COLORS.pending}`}>
                            {o.order_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">${parseFloat(o.total_amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden page-enter">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">All Orders <span className="text-gray-400 font-normal text-sm">({orders?.length ?? 0})</span></h2>
            </div>
            {ordersLoading ? (
              <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : !orders?.length ? (
              <div className="p-8"><EmptyState icon={ShoppingBag} title="No orders yet" description="Orders will appear here once customers start buying." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Order</th>
                      <th className="px-4 py-3 text-left font-semibold">Customer</th>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Payment</th>
                      <th className="px-4 py-3 text-left font-semibold">Total</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors animate-fade-in">
                        <td className="px-6 py-3 font-bold text-blue-600">#{o.id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{o.first_name} {o.last_name}</td>
                        <td className="px-4 py-3 text-gray-500">{o.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.order_status}
                            onChange={e => updateOrderStatus.mutate({ id: o.id, status: e.target.value }, {
                              onSuccess: () => toast.success(`Order #${o.id} updated`),
                              onError:   () => toast.error('Failed to update status'),
                            })}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer ${ORDER_STATUS_COLORS[o.order_status?.toLowerCase()] || ORDER_STATUS_COLORS.pending}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PAY_STATUS_COLORS[o.payment_status] || PAY_STATUS_COLORS.pending}`}>
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">${parseFloat(o.total_amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Products Tab ── */}
        {activeTab === 'products' && (
          <div className="page-enter">
            <ProductsTab productsData={productsData} productsLoading={productsLoading} />
          </div>
        )}

        {/* ── Categories Tab ── */}
        {activeTab === 'categories' && (
          <div className="page-enter">
            <CategoriesTab categories={categories} categoriesLoading={categoriesLoading} />
          </div>
        )}

        {/* ── Coupons Tab ── */}
        {activeTab === 'coupons' && (
          <div className="page-enter">
            <CouponsTab coupons={coupons} couponsLoading={couponsLoading} />
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="page-enter">
            <UsersTab />
          </div>
        )}
      </div>
    </div>
  );
}