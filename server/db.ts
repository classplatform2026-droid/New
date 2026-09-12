import { MongoClient, Db } from 'mongodb';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_HERO_SLIDES, INITIAL_ORDERS } from '../src/data/mockData';
import { BLOG_POSTS } from '../src/data/blogData';
import { Product, Category, BlogPost, HeroSlide, Order, OrderStatus } from '../src/types';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;
let connectionError: string | null = null;

// In-memory local stores as fallback if MongoDB URI is not set or while offline
let localProducts: Product[] = [...INITIAL_PRODUCTS];
let localCategories: Category[] = [...INITIAL_CATEGORIES];
let localBlogs: BlogPost[] = [...BLOG_POSTS];
let localBanners: HeroSlide[] = [...INITIAL_HERO_SLIDES];
let localOrders: Order[] = [...INITIAL_ORDERS];

export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (db) return db;

  if (isConnecting) {
    return null;
  }

  try {
    isConnecting = true;
    console.log('[MongoDB] Connecting to database...');
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    
    // Extract database name from URI or default to 'kasab_gallery'
    db = client.db('kasab_gallery');
    console.log('[MongoDB] Successfully connected to kasab_gallery!');

    // Initialize collections and seed initial data if empty
    await seedInitialData(db);
    connectionError = null;
    return db;
  } catch (err: any) {
    console.error('[MongoDB] Connection error:', err?.message || err);
    connectionError = err?.message || 'Failed to connect to MongoDB';
    db = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

async function seedInitialData(database: Db) {
  try {
    // 1. Categories
    const categoriesCount = await database.collection('categories').countDocuments();
    if (categoriesCount === 0) {
      console.log('[MongoDB Seed] Seeding categories...');
      await database.collection<any>('categories').insertMany(INITIAL_CATEGORIES as any);
    }

    // 2. Products
    const productsCount = await database.collection('products').countDocuments();
    if (productsCount === 0) {
      console.log('[MongoDB Seed] Seeding products...');
      await database.collection<any>('products').insertMany(INITIAL_PRODUCTS as any);
    }

    // 3. Blogs
    const blogsCount = await database.collection('blogs').countDocuments();
    if (blogsCount === 0) {
      console.log('[MongoDB Seed] Seeding blogs...');
      await database.collection<any>('blogs').insertMany(BLOG_POSTS as any);
    }

    // 4. Hero Slides / Banners
    const bannersCount = await database.collection('banners').countDocuments();
    if (bannersCount === 0) {
      console.log('[MongoDB Seed] Seeding hero banners...');
      await database.collection<any>('banners').insertMany(INITIAL_HERO_SLIDES as any);
    }

    // 5. Orders
    const ordersCount = await database.collection('orders').countDocuments();
    if (ordersCount === 0) {
      console.log('[MongoDB Seed] Seeding initial demo orders...');
      await database.collection<any>('orders').insertMany(INITIAL_ORDERS as any);
    }
  } catch (e: any) {
    console.warn('[MongoDB Seed] Note during seeding:', e?.message || e);
  }
}

// ==========================================
// DB REPOSITORY APIS WITH MONGODB & FALLBACK
// ==========================================

export async function getDbStatus() {
  const database = await getDb();
  if (database) {
    const productsCount = await database.collection('products').countDocuments();
    const categoriesCount = await database.collection('categories').countDocuments();
    const blogsCount = await database.collection('blogs').countDocuments();
    const bannersCount = await database.collection('banners').countDocuments();
    const ordersCount = await database.collection('orders').countDocuments();
    return {
      connected: true,
      database: 'MongoDB (Cloud/Atlas)',
      counts: {
        products: productsCount,
        categories: categoriesCount,
        blogs: blogsCount,
        banners: bannersCount,
        orders: ordersCount,
      },
    };
  }

  return {
    connected: false,
    database: 'Local In-Memory DB (Ready for MongoDB URI)',
    note: process.env.MONGODB_URI
      ? `Connection error: ${connectionError || 'Connecting...'}`
      : 'MONGODB_URI is not set. Using initialized persistent data store. Configure MONGODB_URI in Settings / Secrets to bind directly to MongoDB.',
    counts: {
      products: localProducts.length,
      categories: localCategories.length,
      blogs: localBlogs.length,
      banners: localBanners.length,
      orders: localOrders.length,
    },
  };
}

// ---------------- PRODUCTS ----------------
export async function getProducts(): Promise<Product[]> {
  const database = await getDb();
  if (database) {
    const docs = await database.collection('products').find({}).toArray();
    return docs.map((d: any) => ({
      ...d,
      _id: d._id?.toString() || d._id,
    })) as Product[];
  }
  return localProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  const database = await getDb();
  if (database) {
    const doc = await database.collection('products').findOne({ _id: id as any });
    if (doc) {
      return { ...doc, _id: doc._id?.toString() || doc._id } as Product;
    }
  }
  return localProducts.find((p) => p._id === id) || null;
}

export async function createProduct(productData: Omit<Product, '_id' | 'createdAt'>): Promise<Product> {
  const newProduct: Product = {
    ...productData,
    _id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const database = await getDb();
  if (database) {
    await database.collection('products').insertOne(newProduct as any);
  }
  localProducts = [newProduct, ...localProducts];
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const database = await getDb();
  if (database) {
    await database.collection('products').updateOne({ _id: id as any }, { $set: updates });
    const updated = await getProductById(id);
    if (updated) {
      localProducts = localProducts.map((p) => (p._id === id ? updated : p));
      return updated;
    }
  }

  localProducts = localProducts.map((p) => (p._id === id ? { ...p, ...updates } : p));
  return localProducts.find((p) => p._id === id) || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const database = await getDb();
  if (database) {
    try {
      const { ObjectId } = await import('mongodb');
      if (ObjectId.isValid(id)) {
        await database.collection('products').deleteOne({
          $or: [{ _id: id as any }, { _id: new ObjectId(id) as any }]
        });
      } else {
        await database.collection('products').deleteOne({ _id: id as any });
      }
    } catch {
      await database.collection('products').deleteOne({ _id: id as any });
    }
  }
  localProducts = localProducts.filter((p) => p._id !== id && (p as any).id !== id);
  return true;
}

// ---------------- CATEGORIES ----------------
export async function getCategories(): Promise<Category[]> {
  const database = await getDb();
  if (database) {
    const docs = await database.collection('categories').find({}).toArray();
    return docs.map((d: any) => ({
      ...d,
      _id: d._id?.toString() || d._id,
    })) as Category[];
  }
  return localCategories;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const database = await getDb();
  if (database) {
    try {
      const { ObjectId } = await import('mongodb');
      const filter = ObjectId.isValid(id)
        ? { $or: [{ _id: id as any }, { _id: new ObjectId(id) as any }] }
        : { _id: id as any };
      await database.collection('categories').updateOne(filter, { $set: updates });
    } catch {
      await database.collection('categories').updateOne({ _id: id as any }, { $set: updates });
    }
  }
  localCategories = localCategories.map((c) =>
    (c._id === id || (c as any).id === id) ? { ...c, ...updates } : c
  );
  return localCategories.find((c) => c._id === id || (c as any).id === id) || null;
}

export async function createCategory(categoryData: Omit<Category, '_id'> & { _id?: string }): Promise<Category> {
  const newCat: Category = {
    ...categoryData,
    _id: (categoryData._id || `cat-${Date.now()}`) as any,
  };
  const database = await getDb();
  if (database) {
    await database.collection('categories').insertOne({ ...newCat });
  }
  localCategories.push(newCat);
  return newCat;
}

// ---------------- BLOGS ----------------
export async function getBlogs(): Promise<BlogPost[]> {
  const database = await getDb();
  if (database) {
    const docs = await database.collection('blogs').find({}).toArray();
    return docs.map((d: any) => ({
      ...d,
      _id: d._id?.toString() || d._id,
    })) as BlogPost[];
  }
  return localBlogs;
}

// ---------------- BANNERS ----------------
export async function getBanners(): Promise<HeroSlide[]> {
  const database = await getDb();
  if (database) {
    const docs = await database.collection('banners').find({}).toArray();
    return docs.map((d: any) => ({
      ...d,
      _id: d._id?.toString() || d._id,
    })) as HeroSlide[];
  }
  return localBanners;
}

export async function createBanner(bannerData: Omit<HeroSlide, '_id'>): Promise<HeroSlide> {
  const newBanner: HeroSlide = {
    ...bannerData,
    _id: `slide-${Date.now()}`,
  };

  const database = await getDb();
  if (database) {
    await database.collection('banners').insertOne(newBanner as any);
  }
  localBanners = [...localBanners, newBanner];
  return newBanner;
}

export async function updateBanner(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide | null> {
  const database = await getDb();
  if (database) {
    await database.collection('banners').updateOne({ _id: id as any }, { $set: updates });
    const doc = await database.collection('banners').findOne({ _id: id as any });
    if (doc) {
      const updated = { ...doc, _id: doc._id?.toString() || doc._id } as HeroSlide;
      localBanners = localBanners.map((b) => (b._id === id ? updated : b));
      return updated;
    }
  }
  localBanners = localBanners.map((b) => (b._id === id ? { ...b, ...updates } : b));
  return localBanners.find((b) => b._id === id) || null;
}

export async function deleteBanner(id: string): Promise<boolean> {
  const database = await getDb();
  if (database) {
    await database.collection('banners').deleteOne({ _id: id as any });
  }
  localBanners = localBanners.filter((b) => b._id !== id);
  return true;
}

// ---------------- ORDERS ----------------
export async function getOrders(): Promise<Order[]> {
  const database = await getDb();
  if (database) {
    const docs = await database.collection('orders').find({}).sort({ orderDate: -1 }).toArray();
    return docs.map((d: any) => ({
      ...d,
      _id: d._id?.toString() || d._id,
    })) as Order[];
  }
  return localOrders;
}

export async function createOrder(orderData: Omit<Order, '_id' | 'orderDate'>): Promise<Order> {
  const newOrder: Order = {
    ...orderData,
    _id: `KG-${Math.floor(100000 + Math.random() * 900000)}`,
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const database = await getDb();
  if (database) {
    await database.collection('orders').insertOne(newOrder as any);
  }
  localOrders = [newOrder, ...localOrders];
  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const database = await getDb();
  if (database) {
    await database.collection('orders').updateOne({ _id: id as any }, { $set: { status } });
    const doc = await database.collection('orders').findOne({ _id: id as any });
    if (doc) {
      const updated = { ...doc, _id: doc._id?.toString() || doc._id } as Order;
      localOrders = localOrders.map((o) => (o._id === id ? updated : o));
      return updated;
    }
  }

  localOrders = localOrders.map((o) => (o._id === id ? { ...o, status } : o));
  return localOrders.find((o) => o._id === id) || null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const database = await getDb();
  if (database) {
    await database.collection('orders').deleteOne({ _id: id as any });
  }
  localOrders = localOrders.filter((o) => o._id !== id);
  return true;
}
