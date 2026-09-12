import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, Order, HeroSlide, CategoryId, OrderStatus } from '../types';
import { formatBDT } from '../utils/formatters';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Search,
  Check,
  Save,
  ShieldCheck,
  Database,
  RefreshCw,
  Cloud,
  Phone,
  MessageCircle,
  Printer,
  ExternalLink,
  X,
  AlertTriangle,
  Star,
  Utensils,
  Moon,
  Snowflake,
  Folder
} from 'lucide-react';
import { ImageUploadDropzone } from './ImageUploadDropzone';

export const AdminDashboardView: React.FC = () => {
  const {
    products,
    categories,
    orders,
    heroSlides,
    dbStatus,
    isLoadingDb,
    refreshDbData,
    addProduct,
    updateProduct,
    deleteProduct,
    updateCategory,
    addCategory,
    updateOrderStatus,
    deleteOrder,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    language,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'banners'>('orders');

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pBanglaName, setPBanglaName] = useState('');
  const [pCategory, setPCategory] = useState<CategoryId>('food');
  const [pPrice, setPPrice] = useState<number>(500);
  const [pOriginalPrice, setPOriginalPrice] = useState<number>(600);
  const [pImage, setPImage] = useState('');
  const [pImages, setPImages] = useState<string[]>([]);
  const [newImgInput, setNewImgInput] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pBanglaDesc, setPBanglaDesc] = useState('');
  const [pSunnah, setPSunnah] = useState(true);
  const [pBadge, setPBadge] = useState('');
  const [pStock, setPStock] = useState<number>(20);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [cName, setCName] = useState('');
  const [cBanglaName, setCBanglaName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cBanglaDesc, setCBanglaDesc] = useState('');
  const [cImage, setCImage] = useState('');
  const [cIconName, setCIconName] = useState('Sparkles');

  // Banner modal state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bTitle, setBTitle] = useState('');
  const [bBanglaTitle, setBBanglaTitle] = useState('');
  const [bSubtitle, setBSubtitle] = useState('');
  const [bBanglaSubtitle, setBBanglaSubtitle] = useState('');
  const [bImage, setBImage] = useState('');
  const [bBadge, setBBadge] = useState('');
  const [bCta, setBCta] = useState('এখনই কিনুন');

  // Product Filter & Search
  const [searchProduct, setSearchProduct] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ configured: boolean; cloudName?: string; message?: string } | null>(null);

  // In-app deletion confirmation states (replaces iframe-blocked window.confirm)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<HeroSlide | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  React.useEffect(() => {
    fetch('/api/cloudinary/status')
      .then((res) => res.json())
      .then((data) => setCloudinaryStatus(data))
      .catch(() => setCloudinaryStatus({ configured: false }));
  }, []);

  // Helper for category icon
  const getCategoryIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'utensils':
      case 'food':
        return <Utensils className="w-4 h-4" />;
      case 'moon':
      case 'islamic':
        return <Moon className="w-4 h-4" />;
      case 'snowflake':
      case 'winter':
        return <Snowflake className="w-4 h-4" />;
      case 'shoppingbag':
      case 'accessories':
        return <ShoppingBag className="w-4 h-4" />;
      case 'shieldcheck':
        return <ShieldCheck className="w-4 h-4" />;
      case 'package':
        return <Package className="w-4 h-4" />;
      case 'sparkles':
      case 'skincare':
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  // Order stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setPName('');
    setPBanglaName('');
    setPCategory('food');
    setPPrice(500);
    setPOriginalPrice(600);
    const defaultImg = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800';
    setPImage(defaultImg);
    setPImages([defaultImg]);
    setNewImgInput('');
    setPDesc('');
    setPBanglaDesc('');
    setPSunnah(true);
    setPBadge('নতুন কালেকশন');
    setPStock(25);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod._id);
    setPName(prod.name);
    setPBanglaName(prod.banglaName);
    setPCategory(prod.category);
    setPPrice(prod.price);
    setPOriginalPrice(prod.originalPrice || prod.price);
    const initialImgs = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : [prod.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800'];
    setPImage(prod.image || initialImgs[0]);
    setPImages(initialImgs);
    setNewImgInput('');
    setPDesc(prod.description);
    setPBanglaDesc(prod.banglaDescription);
    setPSunnah(!!prod.sunnah_certified);
    setPBadge(prod.badge || '');
    setPStock(prod.stock ?? 25);
    setIsProductModalOpen(true);
  };

  const handleAddProductImage = (urlToAdd: string) => {
    const trimmed = urlToAdd.trim();
    if (!trimmed) return;
    if (pImages.includes(trimmed)) {
      showToast('এই ছবিটি ইতিমধ্যে যুক্ত রয়েছে');
      return;
    }
    const updated = [...pImages, trimmed];
    setPImages(updated);
    if (!pImage) setPImage(trimmed);
    setNewImgInput('');
    showToast('নতুন ছবি যুক্ত হয়েছে');
  };

  const handleRemoveProductImage = (indexToRemove: number) => {
    if (pImages.length <= 1) {
      showToast('পণ্যে কমপক্ষে একটি ছবি থাকা আবশ্যক');
      return;
    }
    const targetUrl = pImages[indexToRemove];
    const updated = pImages.filter((_, idx) => idx !== indexToRemove);
    setPImages(updated);
    if (targetUrl === pImage) {
      setPImage(updated[0]);
    }
    showToast('ছবি বাদ দেওয়া হয়েছে');
  };

  const handleSetPrimaryImage = (url: string) => {
    setPImage(url);
    const updated = [url, ...pImages.filter((img) => img !== url)];
    setPImages(updated);
    showToast('মূল ছবি (Primary) নির্ধারণ করা হয়েছে');
  };

  const handleMoveProductImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pImages.length) return;
    const updated = [...pImages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setPImages(updated);
    if (fromIdx === 0 || toIdx === 0) {
      setPImage(updated[0]);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pBanglaName || !pPrice) {
      showToast('অনুগ্রহ করে পণ্যের নাম ও মূল্য পূরণ করুন');
      return;
    }

    const validImages = pImages.filter((img) => Boolean(img && img.trim()));
    const finalPrimary = (pImage && validImages.includes(pImage)) ? pImage : (validImages[0] || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800');
    const finalImagesList = validImages.length > 0 ? validImages : [finalPrimary];

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: pName,
        banglaName: pBanglaName,
        category: pCategory,
        price: Number(pPrice),
        originalPrice: Number(pOriginalPrice),
        image: finalPrimary,
        images: finalImagesList,
        description: pDesc,
        banglaDescription: pBanglaDesc,
        sunnah_certified: pSunnah,
        badge: pBadge || undefined,
        stock: Number(pStock),
      });
      showToast('পণ্য সফলভাবে আপডেট করা হয়েছে');
    } else {
      addProduct({
        name: pName,
        banglaName: pBanglaName,
        category: pCategory,
        price: Number(pPrice),
        originalPrice: Number(pOriginalPrice),
        image: finalPrimary,
        images: finalImagesList,
        description: pDesc,
        banglaDescription: pBanglaDesc,
        available: true,
        rating: 5.0,
        reviews_count: 1,
        sunnah_certified: pSunnah,
        badge: pBadge || undefined,
        stock: Number(pStock),
      });
      showToast('নতুন পণ্য যোগ করা হয়েছে');
    }
    setIsProductModalOpen(false);
  };

  // Category handlers
  const handleEditCategory = (cat: any) => {
    setEditingCategoryId(cat._id);
    setCName(cat.name || '');
    setCBanglaName(cat.banglaName || '');
    setCBanglaDesc(cat.banglaDescription || cat.descriptionBn || '');
    setCDesc(cat.description || '');
    setCImage(cat.image || '');
    setCIconName(cat.iconName || 'Sparkles');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId || !cBanglaName.trim() || !cName.trim()) {
      showToast('ক্যাটাগরির বাংলা ও ইংরেজি নাম আবশ্যক');
      return;
    }

    updateCategory(editingCategoryId, {
      name: cName.trim(),
      banglaName: cBanglaName.trim(),
      description: cDesc.trim(),
      banglaDescription: cBanglaDesc.trim(),
      image: cImage.trim(),
      iconName: cIconName,
    });

    setIsCategoryModalOpen(false);
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const processingOrders = orders.filter((o) => o.status === 'processing').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

  const handleOpenNewBanner = () => {
    setEditingBannerId(null);
    setBTitle('');
    setBBanglaTitle('');
    setBSubtitle('');
    setBBanglaSubtitle('');
    setBImage('https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=1600');
    setBBadge('প্রিমিয়াম কোয়ালিটি');
    setBCta('এখনই কিনুন');
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (slide: HeroSlide) => {
    setEditingBannerId(slide._id);
    setBTitle(slide.title);
    setBBanglaTitle(slide.banglaTitle);
    setBSubtitle(slide.subtitle || '');
    setBBanglaSubtitle(slide.banglaSubtitle || '');
    setBImage(slide.image);
    setBBadge(slide.badge || '');
    setBCta(slide.ctaText || 'এখনই কিনুন');
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bBanglaTitle || !bImage) {
      showToast('ব্যানারের শিরোনাম ও ইমেজ লিংক দিন');
      return;
    }

    if (editingBannerId) {
      updateHeroSlide(editingBannerId, {
        title: bTitle || bBanglaTitle,
        banglaTitle: bBanglaTitle,
        subtitle: bSubtitle,
        banglaSubtitle: bBanglaSubtitle,
        image: bImage,
        badge: bBadge,
        ctaText: bCta,
      });
      showToast('ব্যানার স্লাইডার সফলভাবে আপডেট হয়েছে');
    } else {
      addHeroSlide({
        title: bTitle || bBanglaTitle,
        banglaTitle: bBanglaTitle,
        subtitle: bSubtitle,
        banglaSubtitle: bBanglaSubtitle,
        image: bImage,
        badge: bBadge,
        ctaText: bCta,
        categoryTarget: 'all',
        linkType: 'catalog',
        active: true,
        order: heroSlides.length + 1,
      });
      showToast('নতুন হিরো স্লাইড যোগ হয়েছে');
    }
    setIsBannerModalOpen(false);
  };

  const currentSelectedOrder = selectedOrder
    ? orders.find((o) => o._id === selectedOrder._id) || selectedOrder
    : null;

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
      return false;
    }
    return true;
  });

  const filteredProducts = products.filter((p) => {
    if (searchProduct.trim()) {
      const q = searchProduct.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.banglaName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d5016] uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4 text-[#d4af37]" />
            <span>Kasab Gallery Merchant Portal</span>
          </div>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-neutral-900">
            অ্যাডমিন ড্যাশবোর্ড (Admin Control)
          </h1>
          <p className="text-xs text-neutral-500">
            রিয়েল-টাইম অর্ডার ম্যানেজমেন্ট, ক্যাটালগ প্রোডাক্ট ও হোমপেজ হিরো ব্যানার কন্ট্রোল
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            অর্ডারসমূহ ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            পণ্য ক্যাটালগ ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ক্যাটাগরি সমূহ ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            হোম ব্যানার স্লাইডার ({heroSlides.length})
          </button>
        </div>
      </div>

      {/* Database & Cloudinary Connection Status Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MongoDB Status */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              dbStatus?.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-neutral-900">
                  {dbStatus?.connected ? 'MongoDB Database: Connected' : 'Database: Ready'}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  dbStatus?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {dbStatus?.connected ? 'Live Atlas Cloud' : 'Express Store'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                {dbStatus?.connected 
                  ? 'সকল ডেটা ক্লাউড MongoDB Atlas থেকে লোড হচ্ছে।' 
                  : (dbStatus?.note || 'Settings / Secrets-এ MONGODB_URI যোগ করতে পারেন।')}
              </p>
            </div>
          </div>

          <button
            onClick={() => refreshDbData()}
            disabled={isLoadingDb}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-[11px] font-semibold text-neutral-700 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {/* Cloudinary Status */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              cloudinaryStatus?.configured ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-neutral-900">
                  Cloudinary ইমেজ সিডিএন
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  cloudinaryStatus?.configured ? 'bg-sky-100 text-sky-800' : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {cloudinaryStatus?.configured ? 'Cloudinary Connected' : 'Upload Ready'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                {cloudinaryStatus?.configured
                  ? 'পণ্য ও ব্যানারের ছবি ক্লাউডিনারি হাই-স্পিড সিডিএন-এ হোস্ট হচ্ছে।'
                  : 'Settings > Secrets-এ CLOUDINARY_CLOUD_NAME, API_KEY ও SECRET যোগ করুন।'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 block">মোট বিক্রয় রেভিনিউ</span>
          <span className="text-xl sm:text-2xl font-black text-[#2d5016] mt-1 block">
            {formatBDT(totalRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">ক্যাশ অন ডেলিভারি ও অনলাইন</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 block">মোট অর্ডার সংখ্যা</span>
          <span className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 block">
            {orders.length} টি
          </span>
          <span className="text-[11px] text-amber-600 font-medium">{pendingOrders} টি প্রসেসিং অপেক্ষা</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 block">মোট সক্রিয় পণ্য</span>
          <span className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 block">
            {products.length} টি
          </span>
          <span className="text-[11px] text-neutral-500">৫টি ক্যাটাগরিতে বিভক্ত</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 block">হোম ব্যানার স্লাইড</span>
          <span className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 block">
            {heroSlides.length} টি
          </span>
          <span className="text-[11px] text-[#2d5016] font-medium">সরাসরি আপডেটযোগ্য</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ORDERS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-brand text-lg font-bold text-neutral-900">
                গ্রাহকদের অর্ডার তালিকা (Customer Orders)
              </h2>
              <p className="text-xs text-neutral-500">
                ক্যাশ অন ডেলিভারি ও হোয়াটসঅ্যাপ অর্ডারের স্ট্যাটাস নিয়ন্ত্রণ ও ইনভয়েস ম্যানেজমেন্ট
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1.5 rounded-2xl">
              {[
                { id: 'all', label: 'সকল অর্ডার', count: orders.length },
                { id: 'pending', label: 'পেন্ডিং', count: pendingOrders, color: 'text-amber-700' },
                { id: 'confirmed', label: 'কনফার্মড', count: confirmedOrders, color: 'text-blue-700' },
                { id: 'processing', label: 'প্রসেসিং', count: processingOrders, color: 'text-purple-700' },
                { id: 'delivered', label: 'ডেলিভারড', count: deliveredOrders, color: 'text-emerald-700' },
                { id: 'cancelled', label: 'বাতিল', count: cancelledOrders, color: 'text-red-700' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    orderStatusFilter === tab.id
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    orderStatusFilter === tab.id ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f6f2] text-neutral-700 font-bold border-y border-neutral-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">অর্ডার আইডি</th>
                  <th className="py-3 px-3">তারিখ</th>
                  <th className="py-3 px-3">গ্রাহক ও যোগাযোগ</th>
                  <th className="py-3 px-3">পণ্য তালিকা</th>
                  <th className="py-3 px-3">ডেলিভারি</th>
                  <th className="py-3 px-3">সর্বমোট</th>
                  <th className="py-3 px-3">স্ট্যাটাস</th>
                  <th className="py-3 px-3">কুইক অ্যাকশন</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-neutral-400">
                      কোনো অর্ডার পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-neutral-900 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-[#2d5016] hover:underline cursor-pointer flex items-center gap-1"
                          title="বিস্তারিত দেখতে ক্লিক করুন"
                        >
                          {order._id}
                        </button>
                        <span className="block text-[10px] text-neutral-400 font-sans">
                          {order.channel === 'whatsapp' ? '📱 WhatsApp' : '🌐 Website COD'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-500 whitespace-nowrap">
                        {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 min-w-[150px]">
                        <span className="font-bold text-neutral-900 block">{order.customer.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a href={`tel:${order.customer.phone}`} className="text-[#2d5016] font-semibold hover:underline inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{order.customer.phone}</span>
                          </a>
                        </div>
                        <span className="text-[11px] text-neutral-400 block line-clamp-1 mt-0.5">
                          {order.customer.address}
                        </span>
                      </td>
                      <td className="py-3 px-3 min-w-[180px]">
                        <div className="space-y-0.5">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="text-[11px] text-neutral-700">
                              <strong>{i.quantity}x</strong> {i.banglaName}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">
                          {order.customer.city}
                        </span>
                        <span className="block text-[10px] text-neutral-400 mt-0.5">
                          চার্জ: {formatBDT(order.delivery_charge)}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-neutral-900 whitespace-nowrap">
                        {formatBDT(order.total)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value as OrderStatus)}
                          className={`text-xs font-bold px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition-colors ${
                            order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.status === 'processing'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : order.status === 'cancelled'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="pending">Pending (অপেক্ষারত)</option>
                          <option value="confirmed">Confirmed (নিশ্চিত)</option>
                          <option value="processing">Processing (প্রস্তুত)</option>
                          <option value="delivered">Delivered (পৌঁছেছে)</option>
                          <option value="cancelled">Cancelled (বাতিল)</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                            title="অর্ডার এখনই নিশ্চিত করুন"
                          >
                            <Check className="w-3 h-3" />
                            <span>কনফার্ম</span>
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'processing')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                            title="প্যাকেজিং ও শিপিং শুরু করুন"
                          >
                            <Truck className="w-3 h-3" />
                            <span>প্রসেসিং</span>
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
                            title="অর্ডারটি সফলভাবে ডেলিভারড মার্ক করুন"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>ডেলিভারড</span>
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> সম্পন্ন
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> বাতিলকৃত
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                            title="অর্ডার বিস্তারিত ও ইনভয়েস দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            title="অর্ডার মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ========================================================= */}
      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-brand text-lg font-bold text-neutral-900">
                পণ্য ক্যাটালগ ব্যবস্থাপনা (Catalog Products)
              </h2>
              <p className="text-xs text-neutral-500">
                নতুন পণ্য যোগ করুন, মূল্য পরিবর্তন করুন অথবা বিবরণ এডিট করুন
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="text-xs border border-neutral-300 rounded-xl px-3 py-2 bg-white"
              />
              <button
                onClick={handleOpenNewProduct}
                className="px-4 py-2 rounded-xl bg-[#2d5016] hover:bg-[#234011] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পণ্য যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* Product Grid / Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f6f2] text-neutral-700 font-bold border-y border-neutral-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">ছবি</th>
                  <th className="py-3 px-3">পণ্যের নাম</th>
                  <th className="py-3 px-3">ক্যাটাগরি</th>
                  <th className="py-3 px-3">বিক্রয় মূল্য</th>
                  <th className="py-3 px-3">স্টক</th>
                  <th className="py-3 px-3">খাঁটি সার্টিফিকেট</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                      />
                    </td>
                    <td className="py-3 px-3 min-w-[200px]">
                      <span className="font-bold text-neutral-900 block">{p.banglaName}</span>
                      <span className="text-[11px] text-neutral-400">{p.name}</span>
                      {p.badge && (
                        <span className="inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold mt-0.5">
                          {p.badge}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-[#2d5016]">
                      {formatBDT(p.price)}
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="block text-[10px] text-neutral-400 line-through font-normal">
                          {formatBDT(p.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-neutral-800">{p.stock} টি</span>
                    </td>
                    <td className="py-3 px-3">
                      {p.sunnah_certified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                          <Check className="w-3.5 h-3.5" /> হ্যাঁ (Pure)
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">না</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          title="পণ্য মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HERO SLIDER MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'banners' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-brand text-lg font-bold text-neutral-900">
                হোমপেজ ব্যানার স্লাইডার (Hero Carousel Manager)
              </h2>
              <p className="text-xs text-neutral-500">
                হোমপেজের মূল প্রমোশনাল ব্যানার ও স্লাইড যুক্ত বা রিমুভ করুন
              </p>
            </div>

            <button
              onClick={handleOpenNewBanner}
              className="px-4 py-2 rounded-xl bg-[#2d5016] hover:bg-[#234011] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ব্যানার যুক্ত করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroSlides.map((slide) => (
              <div
                key={slide._id || slide.id}
                className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-900 relative">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    {slide.badge && (
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 text-[#d4af37] text-[10px] font-bold backdrop-blur-xs">
                        {slide.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-neutral-900 text-sm">{slide.banglaTitle}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-2">{slide.banglaSubtitle}</p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-neutral-200 flex justify-between items-center bg-white">
                  <span className="text-[11px] text-[#2d5016] font-bold">{slide.ctaText}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditBanner(slide)}
                      className="p-1.5 text-neutral-500 hover:text-[#2d5016] hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
                      title="ব্যানার এডিট করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (heroSlides.length <= 1) {
                          showToast('কমপক্ষে ১টি ব্যানার স্লাইড থাকতে হবে');
                          return;
                        }
                        setBannerToDelete(slide);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="ব্যানার ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-brand text-lg font-bold text-neutral-900">
                  ক্যাটাগরি ব্যবস্থাপনা ও আপডেট (Category Management)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2d5016]/10 text-[#2d5016] text-[11px] font-bold">
                  {categories.length} টি ক্যাটাগরি
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                এখানে ক্যাটাগরির নাম, বাংলা বিবরণ, কভার ছবি ও আইকন পরিবর্তন করুন। পরিবর্তন সাথে সাথে হোমপেজ ও ক্যাটালগে প্রতিফলিত হবে।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat._id).length;
              return (
                <div
                  key={cat._id}
                  className="rounded-2xl border border-neutral-200 bg-white hover:border-[#2d5016]/40 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header with Circular Avatar & Title */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-neutral-100 shadow-xs bg-neutral-100">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2d5016]">
                          {getCategoryIcon(cat.iconName)}
                          <span className="uppercase tracking-wider font-mono text-[10px] text-neutral-400">
                            ID: {cat._id}
                          </span>
                        </div>
                        <h3 className="font-serif-brand font-bold text-base text-neutral-900 truncate mt-0.5">
                          {cat.banglaName}
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium truncate">
                          {cat.name}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-[#faf9f5] p-3 rounded-xl border border-neutral-100 space-y-1">
                      <p className="text-xs font-medium text-neutral-700 line-clamp-2">
                        {cat.banglaDescription || cat.descriptionBn || 'কোনো বাংলা বিবরণ নেই'}
                      </p>
                      {cat.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1 italic">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Package className="w-3.5 h-3.5 text-neutral-400" />
                        এই ক্যাটাগরিতে পণ্য:
                      </span>
                      <span className="font-bold text-[#2d5016] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {count} টি
                      </span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      আইকন: <strong className="text-neutral-700">{cat.iconName || 'Sparkles'}</strong>
                    </span>
                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2d5016] text-white hover:bg-[#234011] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>ক্যাটাগরি আপডেট করুন</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD/EDIT PRODUCT MODAL */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif-brand text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              {editingProductId ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    value={pBanglaName}
                    onChange={(e) => setPBanglaName(e.target.value)}
                    placeholder="উদা: খাঁটি সুন্দরবনের মধু"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">ইংরেজি নাম *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Pure Sundarban Wild Honey"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as CategoryId)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white"
                  >
                    <option value="food">খাদ্য (Food)</option>
                    <option value="skincare">স্কিনকেয়ার (Skincare)</option>
                    <option value="accessories">এক্সেসরিজ (Accessories)</option>
                    <option value="islamic">ইসলামিক (Islamic)</option>
                    <option value="winter">শীতের পোশাক (Winter)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">আগের মূল্য (৳)</label>
                  <input
                    type="number"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              {/* MULTIPLE PRODUCT IMAGES GALLERY MANAGER */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#2d5016]" />
                      পণ্যের ছবিসমূহ (Multiple Images Gallery)
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      ১ বা একাধিক ছবি যোগ করতে পারেন। প্রথম ছবিটি মূল কভার (Primary) হিসেবে প্রদর্শিত হবে।
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2d5016]/10 text-[#2d5016] border border-[#2d5016]/20 shrink-0">
                    {pImages.length} টি ছবি যুক্ত
                  </span>
                </div>

                {/* Thumbnails grid */}
                {pImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {pImages.map((imgUrl, idx) => {
                      const isPrimary = pImage ? imgUrl === pImage : idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border-2 bg-white shadow-2xs group transition-all ${
                            isPrimary
                              ? 'border-[#2d5016] ring-2 ring-[#2d5016]/20'
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <div className="aspect-square relative">
                            <img
                              src={imgUrl}
                              alt={`Product ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {isPrimary && (
                              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#2d5016] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 fill-current text-[#d4af37]" />
                                <span>মূল ছবি</span>
                              </div>
                            )}

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveProductImage(idx)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 hover:bg-red-50 text-neutral-500 hover:text-red-600 shadow-xs cursor-pointer transition-colors"
                              title="ছবিটি বাদ দিন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Control row */}
                          <div className="p-1.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                            {!isPrimary ? (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(imgUrl)}
                                className="text-[#2d5016] font-bold hover:underline cursor-pointer"
                              >
                                মূল ছবি করুন
                              </button>
                            ) : (
                              <span className="text-[#2d5016] font-bold">Primary</span>
                            )}

                            {/* Reorder arrows */}
                            <div className="flex items-center gap-0.5 ml-auto">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveProductImage(idx, idx - 1)}
                                className="p-1 rounded text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 cursor-pointer"
                                title="বামে সরান"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                disabled={idx === pImages.length - 1}
                                onClick={() => handleMoveProductImage(idx, idx + 1)}
                                className="p-1 rounded text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 cursor-pointer"
                                title="ডানে সরান"
                              >
                                →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dropzone for adding new image */}
                <div>
                  <ImageUploadDropzone
                    value=""
                    onChange={(url) => {
                      if (url) {
                        handleAddProductImage(url);
                      }
                    }}
                    folder="products"
                    banglaLabel="নতুন ছবি আপলোড করুন (ক্লাউডিনারি সিডিএন)"
                    label="ড্রপ করে বা ব্রাউজ করে আরও ছবি যুক্ত করুন"
                    aspectRatio="square"
                  />
                </div>

                {/* Add by URL input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    value={newImgInput}
                    onChange={(e) => setNewImgInput(e.target.value)}
                    placeholder="অথবা সরাসরি ইমেজ লিংক পেস্ট করুন (https://...)"
                    className="flex-1 p-2 rounded-xl border border-neutral-300 text-xs bg-white focus:border-[#2d5016] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddProductImage(newImgInput)}
                    className="px-3.5 py-2 bg-[#2d5016] hover:bg-[#234011] text-white font-bold rounded-xl text-xs cursor-pointer shrink-0 transition-colors"
                  >
                    + ছবি যোগ করুন
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">বাংলা বিবরণ</label>
                <textarea
                  rows={2}
                  value={pBanglaDesc}
                  onChange={(e) => setPBanglaDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">হাইলাইট ব্যাজ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    placeholder="উদা: ১০০% খাঁটি, সেরা ছাড়"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pSunnahCheck"
                  checked={pSunnah}
                  onChange={(e) => setPSunnah(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2d5016]"
                />
                <label htmlFor="pSunnahCheck" className="text-xs font-semibold text-neutral-800">
                  ১০০% খাঁটি / সুন্নাহ বিশুদ্ধতা সার্টিফাইড পণ্য
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2d5016] text-white font-bold hover:bg-[#234011] cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD/EDIT HERO BANNER MODAL */}
      {/* ========================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif-brand text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              {editingBannerId ? 'ব্যানার স্লাইডার এডিট করুন' : 'নতুন হিরো ব্যানার স্লাইড'}
            </h3>

            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">বাংলা টাইটেল *</label>
                <input
                  type="text"
                  required
                  value={bBanglaTitle}
                  onChange={(e) => setBBanglaTitle(e.target.value)}
                  placeholder="উদা: ১০০% খাঁটি প্রাকৃতিক উপাদান"
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">বাংলা সাবটাইটেল</label>
                <input
                  type="text"
                  value={bBanglaSubtitle}
                  onChange={(e) => setBBanglaSubtitle(e.target.value)}
                  placeholder="উদা: এক ডেলিভারি চার্জে সারা বাংলাদেশে"
                  className="w-full p-2.5 rounded-xl border border-neutral-300"
                />
              </div>

              <div>
                <ImageUploadDropzone
                  value={bImage}
                  onChange={(url) => setBImage(url)}
                  folder="banners"
                  banglaLabel="ব্যানার ছবি আপলোড (Cloudinary Upload)"
                  label="Hero Banner Image"
                  aspectRatio="wide"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">টপ ব্যাজ</label>
                  <input
                    type="text"
                    value={bBadge}
                    onChange={(e) => setBBadge(e.target.value)}
                    placeholder="বিশেষ অফার"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={bCta}
                    onChange={(e) => setBCta(e.target.value)}
                    placeholder="এখনই অর্ডার করুন"
                    className="w-full p-2.5 rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2d5016] text-white font-bold hover:bg-[#234011] cursor-pointer shadow-sm"
                >
                  {editingBannerId ? 'আপডেট সম্পন্ন করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ORDER DETAILS & INVOICE MODAL */}
      {/* ========================================================= */}
      {currentSelectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-brand text-xl font-bold text-neutral-900">
                    অর্ডার ইনভয়েস ও বিবরণ
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-neutral-100 font-bold text-neutral-800">
                    #{currentSelectedOrder._id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentSelectedOrder.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {currentSelectedOrder.channel === 'whatsapp' ? '📱 WhatsApp' : '🌐 Website COD'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  তারিখ: {new Date(currentSelectedOrder.orderDate || currentSelectedOrder.createdAt || Date.now()).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Switcher Bar */}
            <div className="bg-[#f9f8f5] p-3.5 rounded-2xl border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#2d5016]" />
                  <span>অর্ডার বর্তমান স্ট্যাটাস:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentSelectedOrder.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentSelectedOrder.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : currentSelectedOrder.status === 'processing'
                      ? 'bg-purple-100 text-purple-800'
                      : currentSelectedOrder.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentSelectedOrder.status.toUpperCase()}
                  </span>
                </span>
                <span className="text-[11px] text-neutral-500">স্ট্যাটাস পরিবর্তনে ক্লিক করুন:</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { id: 'pending', label: 'পেন্ডিং', color: 'hover:bg-amber-50 text-amber-700 border-amber-300', active: 'bg-amber-500 text-white font-bold' },
                  { id: 'confirmed', label: 'কনফার্মড', color: 'hover:bg-blue-50 text-blue-700 border-blue-300', active: 'bg-blue-600 text-white font-bold' },
                  { id: 'processing', label: 'প্রসেসিং', color: 'hover:bg-purple-50 text-purple-700 border-purple-300', active: 'bg-purple-600 text-white font-bold' },
                  { id: 'delivered', label: 'ডেলিভারড', color: 'hover:bg-emerald-50 text-emerald-700 border-emerald-300', active: 'bg-emerald-600 text-white font-bold' },
                  { id: 'cancelled', label: 'বাতিল', color: 'hover:bg-red-50 text-red-700 border-red-300', active: 'bg-red-600 text-white font-bold' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateOrderStatus(currentSelectedOrder._id, s.id as OrderStatus)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center cursor-pointer transition-all ${
                      currentSelectedOrder.status === s.id
                        ? `${s.active} shadow-xs border-transparent`
                        : `bg-white ${s.color}`
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
              <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                গ্রাহকের ঠিকানা ও তথ্য
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">গ্রাহকের নাম:</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {currentSelectedOrder.customer.name}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">ফোন নম্বর ও দ্রুত যোগাযোগ:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`tel:${currentSelectedOrder.customer.phone}`}
                      className="px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-neutral-800 font-bold hover:bg-neutral-100 inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#2d5016]" />
                      <span>{currentSelectedOrder.customer.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${currentSelectedOrder.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `আসসালামু আলাইকুম ${currentSelectedOrder.customer.name}! Kasab Gallery থেকে যোগাযোগ করছি আপনার অর্ডার #${currentSelectedOrder._id} সংক্রান্ত বিষয়ে।`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold inline-flex items-center gap-1.5"
                      title="গ্রাহককে হোয়াটসঅ্যাপে মেসেজ দিন"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-500 block">ডেলিভারি এলাকা:</span>
                  <span className="font-bold text-neutral-900">
                    {currentSelectedOrder.customer.city}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">সম্পূর্ণ ডেলিভারি ঠিকানা:</span>
                  <span className="font-medium text-neutral-800">
                    {currentSelectedOrder.customer.address}
                  </span>
                </div>
                {currentSelectedOrder.customer.notes && (
                  <div className="sm:col-span-2 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                    <span className="text-[11px] font-bold text-amber-800 block">গ্রাহকের বিশেষ নোট:</span>
                    <p className="text-xs text-amber-900 mt-0.5">{currentSelectedOrder.customer.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                অর্ডারকৃত পণ্য তালিকা
              </h4>
              <div className="border border-neutral-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#f7f6f2] font-bold text-neutral-700 border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">পণ্য</th>
                      <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                      <th className="py-2.5 px-3 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {currentSelectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 flex items-center gap-2.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg border border-neutral-200 shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-bold text-neutral-900 block">{item.banglaName}</span>
                            <span className="text-[11px] text-neutral-400 block">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-neutral-800">
                          {item.quantity} টি
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-600">
                          {formatBDT(item.price)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                          {formatBDT(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment & Invoice Breakdown */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>পণ্য উপমোট (Subtotal):</span>
                <span>{formatBDT(currentSelectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>ডেলিভারি চার্জ ({currentSelectedOrder.customer.city}):</span>
                <span>{formatBDT(currentSelectedOrder.delivery_charge)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-black text-[#2d5016]">
                <span>সর্বমোট প্রদেয় (Cash on Delivery):</span>
                <span className="text-base">{formatBDT(currentSelectedOrder.total)}</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  setOrderToDelete(currentSelectedOrder);
                }}
                className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>অর্ডার ডিলিট করুন</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-50 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট চালান</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 rounded-xl bg-[#2d5016] text-white font-bold text-xs hover:bg-[#234011] cursor-pointer"
                >
                  সম্পন্ন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRODUCT DELETION CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-neutral-900">
                  পণ্য ডিলিট নিশ্চিতকরণ
                </h3>
                <p className="text-xs text-neutral-500">এই অ্যাকশনটি স্থায়ী এবং অপরিবর্তনীয়</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center gap-3">
              {productToDelete.image && (
                <img
                  src={productToDelete.image}
                  alt={productToDelete.name}
                  className="w-14 h-14 object-cover rounded-xl border border-neutral-200 shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-neutral-900 truncate">
                  {productToDelete.banglaName}
                </h4>
                <p className="text-xs text-neutral-500 truncate">{productToDelete.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-[#2d5016]">
                    {formatBDT(productToDelete.price)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-semibold">
                    {productToDelete.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              আপনি কি নিশ্চিত যে <strong className="text-neutral-900 font-bold">"{productToDelete.banglaName}"</strong> পণ্যটি ক্যাটালগ ও ডাটাবেজ থেকে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = productToDelete._id || (productToDelete as any).id;
                  await deleteProduct(targetId);
                  setProductToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BANNER DELETION CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-neutral-900">
                  ব্যানার ডিলিট নিশ্চিতকরণ
                </h3>
                <p className="text-xs text-neutral-500">হোমপেজ স্লাইডার থেকে ব্যানারটি মুছে যাবে</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <div className="aspect-[16/9] w-full bg-neutral-900">
                <img
                  src={bannerToDelete.image}
                  alt={bannerToDelete.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 bg-neutral-50">
                <h4 className="font-bold text-xs text-neutral-900">{bannerToDelete.banglaTitle}</h4>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = bannerToDelete._id || bannerToDelete.id;
                  await deleteHeroSlide(targetId);
                  setBannerToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ORDER DELETION CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-neutral-900">
                  অর্ডার ডিলিট নিশ্চিতকরণ
                </h3>
                <p className="text-xs text-neutral-500">অর্ডারটি ডাটাবেজ থেকে সম্পূর্ণ মুছে যাবে</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-1.5 text-xs">
              <div className="flex justify-between font-mono font-bold">
                <span>অর্ডার আইডি:</span>
                <span className="text-neutral-900">#{orderToDelete._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">গ্রাহক:</span>
                <span className="font-bold text-neutral-900">{orderToDelete.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">সর্বমোট:</span>
                <span className="font-black text-[#2d5016]">{formatBDT(orderToDelete.total)}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              আপনি কি নিশ্চিত যে অর্ডার <strong className="text-neutral-900 font-bold">#{orderToDelete._id}</strong> স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-50 cursor-pointer transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteOrder(orderToDelete._id);
                  if (selectedOrder && selectedOrder._id === orderToDelete._id) {
                    setSelectedOrder(null);
                  }
                  setOrderToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* EDIT CATEGORY MODAL */}
      {/* ========================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#2d5016] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#d4af37]" />
                  ক্যাটাগরি আপডেট
                </span>
                <h3 className="font-serif-brand text-xl font-bold text-neutral-900">
                  {cBanglaName ? `ক্যাটাগরি: ${cBanglaName}` : 'ক্যাটাগরি এডিট'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              {/* Category ID info */}
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between text-neutral-600">
                <span className="font-semibold">ক্যাটাগরি আইডি (Slug):</span>
                <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border">
                  {editingCategoryId}
                </span>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    value={cBanglaName}
                    onChange={(e) => setCBanglaName(e.target.value)}
                    placeholder="উদা: প্রাকৃতিক মধু ও খাদ্য"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium text-xs focus:border-[#2d5016] focus:ring-1 focus:ring-[#2d5016] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">ইংরেজি নাম *</label>
                  <input
                    type="text"
                    required
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="e.g. Pure Food & Honey"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium text-xs focus:border-[#2d5016] focus:ring-1 focus:ring-[#2d5016] outline-none"
                  />
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">ক্যাটাগরি আইকন</label>
                <select
                  value={cIconName}
                  onChange={(e) => setCIconName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-300 bg-white font-medium text-xs focus:border-[#2d5016] focus:ring-1 focus:ring-[#2d5016] outline-none"
                >
                  <option value="Utensils">Utensils (খাদ্য ও পুষ্টি)</option>
                  <option value="Sparkles">Sparkles (স্কিনকেয়ার ও রূপচর্চা)</option>
                  <option value="Moon">Moon (ইসলামিক ও সুন্নাহ সামগ্রী)</option>
                  <option value="Snowflake">Snowflake (শীতের পোশাক / Winter Collection)</option>
                  <option value="ShoppingBag">ShoppingBag (এক্সেসরিজ ও ব্যাগ)</option>
                  <option value="ShieldCheck">ShieldCheck (১০০% বিশুদ্ধ সার্টিফাইড)</option>
                  <option value="Package">Package (প্যাকেজ সামগ্রী)</option>
                </select>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">বাংলা বিবরণ</label>
                <textarea
                  rows={2}
                  value={cBanglaDesc}
                  onChange={(e) => setCBanglaDesc(e.target.value)}
                  placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium text-xs focus:border-[#2d5016] focus:ring-1 focus:ring-[#2d5016] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">ইংরেজি বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="Brief English category description"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium text-xs focus:border-[#2d5016] focus:ring-1 focus:ring-[#2d5016] outline-none"
                />
              </div>

              {/* Category Cover Image with Live Preview */}
              <div className="space-y-2">
                <label className="block font-bold text-neutral-700">ক্যাটাগরি কভার ছবি</label>
                
                {/* Live circular preview like HomeView */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-50 border border-neutral-200">
                  <div className="w-16 h-16 rounded-full p-0.5 bg-white border-2 border-[#2d5016] shadow-xs shrink-0 overflow-hidden">
                    <img
                      src={cImage || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800'}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">হোমপেজ সার্কেল প্রিভিউ</span>
                    <span className="text-[11px] text-neutral-500">হোমপেজের কালেকশন সার্কেলে এই ছবিটি প্রদর্শিত হবে।</span>
                  </div>
                </div>

                <ImageUploadDropzone
                  value={cImage}
                  onChange={(url) => setCImage(url)}
                  folder="categories"
                  banglaLabel="নতুন ক্যাটাগরি ছবি আপলোড (Cloudinary Upload)"
                  label="ছবি ড্রপ করুন বা ব্রাউজ করুন"
                  aspectRatio="square"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2d5016] text-white font-bold hover:bg-[#234011] cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>ক্যাটাগরি আপডেট সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
