'use client';

import React, { useState, useEffect } from 'react';
import {
  Coffee, Sparkles, ShoppingBag, ArrowRight, Clock, MapPin,
  Printer, Lock, X, Upload, Plus, Trash2, CheckCircle2, Edit2
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isCoffeeSweet: boolean;
  isAvailable: boolean;
}

interface CartItem extends MenuItem {
  cartId: string;
  milk: string;
  temp: string;
}

export default function BaristaLabApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'sweets' | 'careers' | 'about'>('home');
  const [isAdminView, setIsAdminView] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [latestOrder, setLatestOrder] = useState<any>(null);

  // Auth State
  const [showPassModal, setShowPassModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(false);

  // Admin Subtabs & Data
  const [adminSubTab, setAdminSubTab] = useState<'kds' | 'items' | 'applicants'>('items');
  const [orders, setOrders] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);

  // Modals for Editing and Adding
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: 'Coffee Sweets',
    price: 8.5,
    description: '',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    isCoffeeSweet: true,
  });

  // Application Modal
  const [jobModalRole, setJobModalRole] = useState<string | null>(null);
  const [appForm, setAppForm] = useState({
    name: '',
    email: '',
    phone: '',
    availability: '',
    experience: '',
  });
  const [appSuccess, setAppSuccess] = useState(false);

  // Checkout Form
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    pickupTime: '15 Mins',
  });

  const loadData = async () => {
    try {
      const res = await fetch('/api/lab?type=all');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/lab?type=admin');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.items);
        setOrders(data.orders);
        setApplicants(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === 'barista123') {
      setIsStaffAuthenticated(true);
      setShowPassModal(false);
      setIsAdminView(true);
      setPassInput('');
      loadAdminData();
    } else {
      alert('Incorrect passcode. Use: barista123');
    }
  };

  const addToCart = (item: MenuItem, milk = 'Full Cream', temp = 'Hot') => {
    const newItem: CartItem = {
      ...item,
      cartId: `${item.id}-${Date.now()}`,
      milk,
      temp,
    };
    setCart((prev) => [...prev, newItem]);
    setShowCartDrawer(true);
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_ORDER',
          customerName: checkoutData.name,
          phone: checkoutData.phone,
          pickupTime: checkoutData.pickupTime,
          total: cartTotal,
          items: cart,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        setLatestOrder({ ...order, items: cart });
        setCart([]);
        setShowCartDrawer(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobModalRole) return;

    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPLY_JOB',
          roleTitle: jobModalRole,
          ...appForm,
        }),
      });

      if (res.ok) {
        setAppSuccess(true);
        setTimeout(() => {
          setAppSuccess(false);
          setJobModalRole(null);
          setAppForm({ name: '', email: '', phone: '', availability: '', experience: '' });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Convert uploaded image file to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Item
  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_MENU_ITEM',
          pass: 'barista123',
          ...newItemData,
        }),
      });

      if (res.ok) {
        setShowAddItemModal(false);
        setNewItemData({
          name: '',
          category: 'Coffee Sweets',
          price: 8.5,
          description: '',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
          isCoffeeSweet: true,
        });
        loadAdminData();
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Item Edit
  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MENU_ITEM',
          pass: 'barista123',
          ...editingItem,
        }),
      });

      if (res.ok) {
        setEditingItem(null);
        loadAdminData();
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;

    try {
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_MENU_ITEM',
          pass: 'barista123',
          id,
        }),
      });

      if (res.ok) {
        loadAdminData();
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#2C221E] font-sans antialiased selection:bg-[#F3D7C5]">
      {/* Cute Top Banner */}
      <div className="bg-[#5B3E31] text-[#F7ECE1] py-1.5 px-4 text-center text-xs tracking-wide font-mono flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#E7A97E]" />
        <span>MELBOURNE SPECIALTY COFFEE & ARTISAN COFFEE SWEETS • FOUNDED BY KASORN (KAY) LEELAPISUTH</span>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-[#EFE7DE] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div
            onClick={() => { setActiveTab('home'); setIsAdminView(false); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EEDCCE] flex items-center justify-center text-[#5B3E31] group-hover:scale-105 transition shadow-xs">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl tracking-tight text-[#3A2820]">Barista Lab</span>
                <span className="text-[10px] font-mono bg-[#F2DFD3] text-[#7A4B3A] px-2 py-0.5 rounded-full font-bold">
                  Cremorne
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A70] tracking-wide">Roastery & Coffee Sweets</p>
            </div>
          </div>

          {!isAdminView ? (
            <nav className="hidden md:flex items-center gap-1 bg-[#F9F4EE] p-1.5 rounded-full border border-[#E9DFD5] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-full transition ${activeTab === 'home' ? 'bg-white text-[#4A3228] shadow-xs' : 'text-[#7D6B62] hover:text-[#3A2820]'}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded-full transition ${activeTab === 'menu' ? 'bg-white text-[#4A3228] shadow-xs' : 'text-[#7D6B62] hover:text-[#3A2820]'}`}
              >
                Menu & Pre-Order
              </button>
              <button
                onClick={() => setActiveTab('sweets')}
                className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${activeTab === 'sweets' ? 'bg-[#5B3E31] text-white shadow-xs' : 'text-[#7D6B62] hover:text-[#3A2820]'}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E7A97E]" />
                Coffee Sweets
              </button>
              <button
                onClick={() => setActiveTab('careers')}
                className={`px-4 py-2 rounded-full transition ${activeTab === 'careers' ? 'bg-white text-[#4A3228] shadow-xs' : 'text-[#7D6B62] hover:text-[#3A2820]'}`}
              >
                Work With Us
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 rounded-full transition ${activeTab === 'about' ? 'bg-white text-[#4A3228] shadow-xs' : 'text-[#7D6B62] hover:text-[#3A2820]'}`}
              >
                Our Story
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                STAFF KDS & MENU MANAGER
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {!isAdminView ? (
              <>
                <button
                  onClick={() => setShowCartDrawer(true)}
                  className="relative p-2.5 rounded-full bg-[#F5ECE3] hover:bg-[#EBDBCF] text-[#4A3228] transition"
                  title="Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#D96B43] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cart.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (isStaffAuthenticated) {
                      setIsAdminView(true);
                      loadAdminData();
                    } else {
                      setShowPassModal(true);
                    }
                  }}
                  className="text-xs font-semibold px-3.5 py-2 rounded-full border border-[#D5C2B4] text-[#695146] hover:bg-[#F8EFE9] transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Staff Login
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsAdminView(false); loadData(); }}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-[#5B3E31] text-white hover:bg-[#432C22] transition"
              >
                Back to Customer View
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CUSTOMER VIEW */}
      {!isAdminView && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-16">
              <div className="relative rounded-3xl bg-linear-to-br from-[#F5ECE3] via-[#FDF7F2] to-[#EEDCCE] p-8 md:p-14 border border-[#EBE0D5] overflow-hidden">
                <div className="max-w-xl space-y-4">
                  <span className="text-xs font-mono font-bold text-[#8C583E] uppercase tracking-wider bg-white/70 px-3 py-1 rounded-full border border-[#E7D6CA]">
                    Specialty Coffee meets Pastry Craft
                  </span>
                  <h1 className="font-serif text-4xl sm:text-5xl font-black text-[#2D1E17] leading-tight">
                    Where every espresso has a sweet soul.
                  </h1>
                  <p className="text-sm sm:text-base text-[#6F5B51] leading-relaxed">
                    Founded in Cremorne by barista-designer Kasorn Leelapisuth (Kay), Barista Lab pairs light-roast floral Ethiopians with house-made pastries infused with fresh espresso shots.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('sweets')}
                      className="bg-[#5B3E31] text-white text-xs font-semibold px-6 py-3.5 rounded-full hover:bg-[#432C22] transition flex items-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-[#F7C6A3]" />
                      Explore Coffee Sweets
                    </button>
                    <button
                      onClick={() => setActiveTab('menu')}
                      className="bg-white text-[#4A3228] border border-[#DFCFC2] text-xs font-semibold px-6 py-3.5 rounded-full hover:bg-[#F9F4EE] transition"
                    >
                      Pre-order For Pickup
                    </button>
                  </div>
                </div>
              </div>

              {/* Sweets Grid */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#2D1E17]">Signature Coffee Sweets</h2>
                    <p className="text-xs text-[#7B675E] mt-1">Handcrafted daily in our pastry lab using single-origin espresso.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('sweets')}
                    className="text-xs font-bold text-[#985338] hover:underline flex items-center gap-1"
                  >
                    View All Sweets <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  {menuItems.filter((i) => i.isCoffeeSweet).slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#ECE0D5] p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-40 rounded-xl overflow-hidden mb-3 bg-[#F4ECE4]">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-sm text-[#2D1E17]">{item.name}</h3>
                        <p className="text-[11px] text-[#78645B] line-clamp-2 mt-1">{item.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F2E8E0]">
                        <span className="font-mono font-bold text-sm text-[#8C583E]">${item.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-[#5B3E31] text-white p-2 rounded-xl hover:bg-[#3D291F] transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-[#FAF5EE] rounded-3xl border border-[#E9DFD3] text-center font-mono text-xs text-[#6A574E]">
                <div className="space-y-1">
                  <Clock className="w-5 h-5 mx-auto text-[#9B624A]" />
                  <div className="font-bold text-[#2D1E17]">OPEN 7 DAYS</div>
                  <div>Mon-Fri: 6:30 AM - 3:30 PM</div>
                  <div>Weekends: 7:30 AM - 4:00 PM</div>
                </div>
                <div className="space-y-1">
                  <MapPin className="w-5 h-5 mx-auto text-[#9B624A]" />
                  <div className="font-bold text-[#2D1E17]">CREMORNE LAB</div>
                  <div>84 Balmain Street, Cremorne</div>
                  <div>Melbourne, VIC 3121</div>
                </div>
                <div className="space-y-1">
                  <Coffee className="w-5 h-5 mx-auto text-[#9B624A]" />
                  <div className="font-bold text-[#2D1E17]">EXTRACTION LAB</div>
                  <div>La Marzocco PB 3-Group</div>
                  <div>Minor Figures & Bonsoy stocked</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MENU & PRE-ORDER */}
          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#2D1E17]">Lab Menu & Express Pre-Order</h1>
                <p className="text-xs text-[#7B675E] mt-1">Pre-order for fast 15-minute express pick-up from our Cremorne bar.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#EBE0D5] p-4 flex flex-col justify-between shadow-xs hover:border-[#D5BFAF] transition"
                  >
                    <div>
                      <div className="h-44 rounded-xl overflow-hidden mb-3 bg-[#F4ECE4]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-[#2D1E17]">{item.name}</h3>
                        <span className="text-[10px] font-mono bg-[#F2DFD3] text-[#7A4B3A] px-2 py-0.5 rounded-full font-bold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#735F56] mt-1.5 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#F0E5DC]">
                      <span className="font-mono font-bold text-base text-[#8C583E]">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-[#5B3E31] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#432C22] transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COFFEE SWEETS SHOWCASE */}
          {activeTab === 'sweets' && (
            <div className="space-y-8">
              <div className="bg-[#5B3E31] text-white rounded-3xl p-8 md:p-12">
                <span className="text-xs font-mono font-bold text-[#F3C4A5] uppercase tracking-wider">
                  Pastry Lab Exclusive
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2">
                  Artisan Coffee-Infused Sweets
                </h1>
                <p className="text-xs sm:text-sm text-[#D7C5BC] mt-2 max-w-xl leading-relaxed">
                  Real espresso extractions pulled directly into sweet treats—never artificial flavourings or syrups.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.filter((i) => i.isCoffeeSweet).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E9DED3] p-5 flex flex-col sm:flex-row gap-5 shadow-xs items-center"
                  >
                    <div className="w-full sm:w-44 h-40 rounded-xl overflow-hidden shrink-0 bg-[#F5ECE3]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base text-[#2D1E17]">{item.name}</h3>
                        <span className="font-mono font-bold text-[#8C583E]">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-[#705C53] leading-relaxed">{item.description}</p>
                      <button
                        onClick={() => addToCart(item)}
                        className="mt-3 bg-[#FAF3EC] border border-[#DECBC0] text-[#5B3E31] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#5B3E31] hover:text-white transition flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Order Sweet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WORK WITH US */}
          {activeTab === 'careers' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono font-bold text-[#8C583E] uppercase tracking-wider bg-[#F5EAE1] px-3 py-1 rounded-full border border-[#E8D9CD]">
                  Careers at Barista Lab
                </span>
                <h1 className="font-serif text-3xl font-bold text-[#2D1E17]">Join Our Melbourne Team</h1>
                <p className="text-xs sm:text-sm text-[#735F56] max-w-md mx-auto">
                  We look for warm people who care about specialty coffee, precision extraction, and thoughtful hospitality.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'Specialty Coffee Barista (Casual / Part-Time)',
                    rate: '$32.50 - $36.00/hr + Super',
                    desc: 'Dialing in washed Ethiopians and single origins on our 3-group PB. Good latte art standards and warm customer interactions.',
                  },
                  {
                    title: 'Pastry & Coffee Sweets Baker (Part-Time)',
                    rate: '$34.00/hr + Penalty Rates',
                    desc: 'Baking mille-feuilles, Basque burnt cheesecakes, and canelés. Experience with lamination and espresso reductions preferred.',
                  },
                  {
                    title: 'Cafe All-Rounder & Floor Support (Casual)',
                    rate: '$30.50/hr + Super',
                    desc: 'POS service, pastry presentation, table clearing, and assisting on batch brew. Great weekend flexibility required.',
                  },
                ].map((job, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#EAE0D6] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-[#2D1E17]">{job.title}</h3>
                      <div className="font-mono text-xs text-[#8C583E] font-semibold">{job.rate}</div>
                      <p className="text-xs text-[#735F56] max-w-xl leading-relaxed">{job.desc}</p>
                    </div>
                    <button
                      onClick={() => setJobModalRole(job.title)}
                      className="bg-[#5B3E31] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#432C22] transition shrink-0"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OUR STORY (FOUNDER SPOTLIGHT) */}
          {activeTab === 'about' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="rounded-3xl overflow-hidden h-72 bg-[#EEDCCE] relative border border-[#E7D6CA]">
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80"
                  alt="Barista Lab Cremorne"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="inline-block bg-[#F4E8DF] text-[#7A4B3A] font-mono text-xs font-bold px-3 py-1 rounded-full border border-[#E8D4C6]">
                  FOUNDER SPOTLIGHT
                </div>
                <h1 className="font-serif text-3xl font-bold text-[#2D1E17]">
                  Founded by Kasorn Leelapisuth (Kay)
                </h1>
                <p className="text-sm text-[#6C5950] leading-relaxed">
                  Barista Lab was established in 2026 by <strong>Kasorn Leelapisuth (Kay)</strong> in Cremorne, Melbourne. Blending a background in software development with hands-on Melbourne specialty coffee craftsmanship, Kay founded Barista Lab to explore a singular passion: pairing precision-calibrated espresso with artisanal bakery recipes.
                </p>
                <p className="text-sm text-[#6C5950] leading-relaxed">
                  "In Melbourne, coffee is an art of calibration and micro-adjustments," says Kay. "We wanted our dessert menu to respect the exact same standard. When we fold Ethiopian coffee into a mille-feuille or cold brew reduction into a Basque cheesecake, you taste the genuine floral jasmine and stone fruit terroir of the coffee beans."
                </p>
              </div>

              <div className="border-t border-[#EAE0D6] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-[#6F5B52]">
                <div className="bg-[#FAF5EE] p-4 rounded-2xl border border-[#EFE5DB]">
                  <span className="font-bold text-[#2D1E17] block mb-1">FOUNDER & HEAD OF COFFEE</span>
                  <div>Kasorn Leelapisuth (Kay)</div>
                  <div className="text-[11px] text-[#8C7A70] mt-0.5">Melbourne, Victoria, Australia</div>
                </div>
                <div className="bg-[#FAF5EE] p-4 rounded-2xl border border-[#EFE5DB]">
                  <span className="font-bold text-[#2D1E17] block mb-1">ROASTING & SOURCING</span>
                  <div>Direct-Trade Heirlooms (Yirgacheffe & Huila)</div>
                  <div className="text-[11px] text-[#8C7A70] mt-0.5">St David Dairy & Minor Figures Oat</div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* STAFF / ADMIN VIEW */}
      {isAdminView && (
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex border-b border-[#EAE0D6] justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setAdminSubTab('items')}
                className={`pb-3 font-semibold text-xs tracking-wide transition border-b-2 ${adminSubTab === 'items' ? 'border-[#5B3E31] text-[#5B3E31]' : 'border-transparent text-[#8C7A70]'}`}
              >
                Manage Menu & Photos ({menuItems.length})
              </button>
              <button
                onClick={() => setAdminSubTab('kds')}
                className={`pb-3 font-semibold text-xs tracking-wide transition border-b-2 ${adminSubTab === 'kds' ? 'border-[#5B3E31] text-[#5B3E31]' : 'border-transparent text-[#8C7A70]'}`}
              >
                Live Kitchen Orders ({orders.filter((o) => o.status !== 'COMPLETED').length})
              </button>
              <button
                onClick={() => setAdminSubTab('applicants')}
                className={`pb-3 font-semibold text-xs tracking-wide transition border-b-2 ${adminSubTab === 'applicants' ? 'border-[#5B3E31] text-[#5B3E31]' : 'border-transparent text-[#8C7A70]'}`}
              >
                Job Applications ({applicants.length})
              </button>
            </div>

            {adminSubTab === 'items' && (
              <button
                onClick={() => setShowAddItemModal(true)}
                className="bg-[#5B3E31] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#432C22] transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add New Menu Item
              </button>
            )}
          </div>

          {/* SUBTAB: MANAGE MENU & PHOTOS */}
          {adminSubTab === 'items' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-[#7B675E]">
                  Every update or deletion is immediately stored to your Neon PostgreSQL database.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#EAE0D6] rounded-2xl p-4 flex gap-4 items-center shadow-xs"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#F5ECE3] shrink-0 border border-[#E9DFD4]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-[#2D1E17]">{item.name}</h4>
                        <span className="font-mono text-xs text-[#8C583E] font-semibold">${item.price.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] font-mono bg-[#F2DFD3] text-[#7A4B3A] px-2 py-0.5 rounded-full font-bold">
                        {item.category}
                      </span>
                      <p className="text-[11px] text-[#7A665D] line-clamp-1 mt-1">{item.description}</p>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#FAF4ED] text-[#5B3E31] border border-[#DECBC0] hover:bg-[#5B3E31] hover:text-white transition flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit / Photo
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBTAB: LIVE KDS ORDERS */}
          {adminSubTab === 'kds' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {orders.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-xs font-mono text-[#8C7A70]">
                  No active orders right now.
                </div>
              ) : (
                orders.map((ord) => {
                  const items = JSON.parse(ord.itemsJson || '[]');
                  return (
                    <div
                      key={ord.id}
                      className="bg-white border border-[#E9DED4] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-[#F4EBE3]">
                          <span className="font-mono font-bold text-sm text-[#93553C]">{ord.orderNumber}</span>
                          <span className="text-[10px] font-mono bg-[#F3E5DA] text-[#6E4230] px-2 py-0.5 rounded font-bold">
                            {ord.status}
                          </span>
                        </div>
                        <div className="text-xs">
                          <div className="font-bold text-[#2D1E17]">{ord.customerName}</div>
                          <div className="text-[#8C7A70] font-mono">{ord.phone} • Pickup: {ord.pickupTime}</div>
                        </div>
                        <div className="space-y-1.5 pt-2">
                          {items.map((i: any, idx: number) => (
                            <div key={idx} className="text-xs flex justify-between text-[#5B473E]">
                              <span>{i.name} ({i.milk})</span>
                              <span className="font-mono">${i.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-[#F4EBE3] flex justify-between items-center">
                        <span className="font-mono font-bold text-sm">${ord.total.toFixed(2)}</span>
                        {ord.status !== 'COMPLETED' && (
                          <button
                            onClick={async () => {
                              await fetch('/api/lab', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: 'UPDATE_ORDER_STATUS',
                                  pass: 'barista123',
                                  id: ord.id,
                                  status: ord.status === 'PENDING' ? 'READY' : 'COMPLETED',
                                }),
                              });
                              loadAdminData();
                            }}
                            className="bg-[#5B3E31] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#432C22] transition"
                          >
                            Mark {ord.status === 'PENDING' ? 'Ready' : 'Completed'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SUBTAB: APPLICANTS ATS */}
          {adminSubTab === 'applicants' && (
            <div className="space-y-4">
              {applicants.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-[#8C7A70]">
                  No job applications received yet.
                </div>
              ) : (
                applicants.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white border border-[#E9DFD5] rounded-2xl p-5 space-y-2 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-[#2D1E17]">{app.name}</h4>
                        <div className="text-xs text-[#8C583E] font-medium">{app.roleTitle}</div>
                      </div>
                      <span className="font-mono text-[10px] bg-[#F2DFD3] text-[#7A4B3A] px-2 py-0.5 rounded font-bold">
                        {app.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#7D6B62] flex gap-4">
                      <span>Email: {app.email}</span>
                      <span>Phone: {app.phone}</span>
                    </div>
                    <div className="text-xs font-mono text-[#5B3E31]">
                      <strong>Availability:</strong> {app.availability}
                    </div>
                    <p className="text-xs text-[#6F5B52] bg-[#FAF5EE] p-3 rounded-xl border border-[#EDE2D7]">
                      {app.experience}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      )}

      {/* MODAL: STAFF PASSWORD CHECK */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-[#EAE0D6]">
            <div className="flex justify-between items-center pb-3 border-b border-[#F2E8DF]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8C583E]" />
                <h3 className="font-bold text-sm text-[#2D1E17]">Staff Passcode Required</h3>
              </div>
              <button onClick={() => setShowPassModal(false)} className="text-[#99867D] hover:text-[#2D1E17]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#7A675E] mt-3">
              Enter the staff login code to manage live orders and menu items.
            </p>
            <div className="mt-2 text-[11px] font-mono bg-[#FAF3EC] text-[#8C583E] p-2 rounded-lg border border-[#ECD9CC]">
              Demo Passcode: <strong>barista123</strong>
            </div>

            <form onSubmit={handleStaffLogin} className="mt-4 space-y-3">
              <input
                type="password"
                required
                placeholder="Enter password..."
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                className="w-full border border-[#DBC8BB] rounded-xl p-2.5 text-xs outline-none focus:border-[#5B3E31]"
              />
              <button
                type="submit"
                className="w-full bg-[#5B3E31] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#432C22] transition"
              >
                Unlock Staff Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW MENU ITEM (ADMIN ONLY) */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#EAE0D6]">
            <div className="flex justify-between items-center pb-3 border-b border-[#F2E8DF]">
              <h3 className="font-bold text-sm text-[#2D1E17]">Add New Menu Item</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-[#99867D] hover:text-[#2D1E17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#5B473E]">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dirty Matcha Affogato"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#5B473E]">Category</label>
                  <select
                    value={newItemData.category}
                    onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                  >
                    <option value="Coffee Sweets">Coffee Sweets</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Pastry">Pastry</option>
                    <option value="Signature">Signature</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#5B473E]">Price ($ AUD)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newItemData.price}
                    onChange={(e) => setNewItemData({ ...newItemData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#5B473E] flex justify-between">
                  <span>Photo Upload</span>
                  <span className="text-[10px] text-[#8C583E]">Upload from device</span>
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF4ED] border border-[#DBC8BB] shrink-0">
                    <img src={newItemData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <label className="cursor-pointer bg-[#FAF4ED] border border-[#DBC8BB] text-[#5B3E31] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#5B3E31] hover:text-white transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Device Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setNewItemData({ ...newItemData, image: url }))
                      }
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#5B473E]">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail roast extraction, taste notes, or pastry texture..."
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                  className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isSweet"
                  checked={newItemData.isCoffeeSweet}
                  onChange={(e) => setNewItemData({ ...newItemData, isCoffeeSweet: e.target.checked })}
                  className="rounded border-[#DBC8BB]"
                />
                <label htmlFor="isSweet" className="text-xs text-[#5B473E]">
                  Feature in Coffee Sweets Showcase
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5B3E31] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#432C22] transition mt-2"
              >
                Save & Add to Menu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ITEM / UPLOAD PHOTO */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#EAE0D6]">
            <div className="flex justify-between items-center pb-3 border-b border-[#F2E8DF]">
              <h3 className="font-bold text-sm text-[#2D1E17]">Edit {editingItem.name}</h3>
              <button onClick={() => setEditingItem(null)} className="text-[#99867D] hover:text-[#2D1E17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#5B473E]">Item Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#5B473E]">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                  >
                    <option value="Coffee Sweets">Coffee Sweets</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Pastry">Pastry</option>
                    <option value="Signature">Signature</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#5B473E]">Price ($ AUD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#5B473E] flex justify-between">
                  <span>Item Photo</span>
                  <span className="text-[10px] text-[#8C583E]">Upload directly from device</span>
                </label>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF4ED] border border-[#DBC8BB] shrink-0">
                    <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <label className="cursor-pointer bg-[#FAF4ED] border border-[#DBC8BB] text-[#5B3E31] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#5B3E31] hover:text-white transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Device Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => setEditingItem({ ...editingItem, image: url }))
                      }
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#5B473E]">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsSweet"
                  checked={editingItem.isCoffeeSweet}
                  onChange={(e) => setEditingItem({ ...editingItem, isCoffeeSweet: e.target.checked })}
                  className="rounded border-[#DBC8BB]"
                />
                <label htmlFor="editIsSweet" className="text-xs text-[#5B473E]">
                  Feature in Coffee Sweets Showcase
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5B3E31] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#432C22] transition mt-2"
              >
                Save Changes to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: JOB APPLICATION */}
      {jobModalRole && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#EAE0D6]">
            <div className="flex justify-between items-center pb-3 border-b border-[#F2E8DF]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8C583E] uppercase">Applying For</span>
                <h3 className="font-bold text-sm text-[#2D1E17]">{jobModalRole}</h3>
              </div>
              <button onClick={() => setJobModalRole(null)} className="text-[#99867D] hover:text-[#2D1E17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {appSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-[#2D1E17]">Application Sent!</h4>
                <p className="text-xs text-[#7A675E]">Kasorn and the team will be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleJobSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#5B473E]">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Maya"
                    value={appForm.name}
                    onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-[#5B473E]">Email</label>
                    <input
                      required
                      type="email"
                      placeholder="you@email.com"
                      value={appForm.email}
                      onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                      className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#5B473E]">Mobile</label>
                    <input
                      required
                      type="tel"
                      placeholder="0400 000 000"
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-[#5B473E]">Weekly Availability</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Wednesday free after 1 PM, anytime on weekends"
                    value={appForm.availability}
                    onChange={(e) => setAppForm({ ...appForm, availability: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5B473E]">Relevant Experience</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about machine experience, latte art, or pastry baking..."
                    value={appForm.experience}
                    onChange={(e) => setAppForm({ ...appForm, experience: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2.5 outline-none focus:border-[#5B3E31]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#5B3E31] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#432C22] transition mt-2"
                >
                  Send Application to Kasorn (Kay)
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DRAWER: CART */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-[#F2E8DF]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#8C583E]" />
                  <h3 className="font-bold text-base text-[#2D1E17]">Your Pre-Order Cart</h3>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="text-[#99867D] hover:text-[#2D1E17]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#8C7A70] font-mono">
                  Your cart is empty. Pick a coffee or sweet to start!
                </div>
              ) : (
                <div className="divide-y divide-[#F2E8DF] my-4">
                  {cart.map((item) => (
                    <div key={item.cartId} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-[#2D1E17]">{item.name}</div>
                        <div className="text-[11px] text-[#7A675E]">{item.milk} • {item.temp}</div>
                        <div className="font-mono text-[#8C583E] font-semibold mt-0.5">${item.price.toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-red-500 hover:text-red-700 text-xs p-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-[#F2E8DF] space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#5B473E]">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Sophie"
                    value={checkoutData.name}
                    onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2 outline-none focus:border-[#5B3E31]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5B473E]">Mobile Phone</label>
                  <input
                    required
                    type="tel"
                    placeholder="0400 000 000"
                    value={checkoutData.phone}
                    onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2 outline-none focus:border-[#5B3E31]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5B473E]">Estimated Pickup Time</label>
                  <select
                    value={checkoutData.pickupTime}
                    onChange={(e) => setCheckoutData({ ...checkoutData, pickupTime: e.target.value })}
                    className="w-full mt-1 border border-[#DBC8BB] rounded-xl p-2 outline-none focus:border-[#5B3E31]"
                  >
                    <option value="15 Mins">In 15 Mins</option>
                    <option value="30 Mins">In 30 Mins</option>
                    <option value="45 Mins">In 45 Mins</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-between font-bold text-sm text-[#2D1E17]">
                  <span>Total Amount (Inc. GST)</span>
                  <span className="font-mono text-[#8C583E]">${cartTotal.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#5B3E31] text-white font-semibold py-3 rounded-xl hover:bg-[#432C22] transition mt-2"
                >
                  Place Pre-Order & Print Receipt
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE RECEIPT */}
      {latestOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#D5C2B4] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                ORDER CONFIRMED
              </span>
              <button onClick={() => setLatestOrder(null)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-dashed border-[#D5C2B4] font-mono text-xs text-[#2D1E17] space-y-3">
              <div className="text-center space-y-0.5">
                <div className="font-bold text-sm tracking-widest uppercase">BARISTA LAB CREMORNE</div>
                <div className="text-[10px] text-zinc-500">84 Balmain St, Melbourne VIC</div>
                <div className="text-[10px] text-zinc-500">ABN: 42 109 482 119</div>
              </div>

              <div className="border-t border-b border-dashed border-[#D5C2B4] py-2 space-y-1">
                <div className="flex justify-between">
                  <span>DOCKET #:</span>
                  <span className="font-bold">{latestOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{latestOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PICKUP:</span>
                  <span>{latestOrder.pickupTime}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {latestOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <div>{item.name}</div>
                      <div className="text-[10px] text-zinc-500">{item.milk}</div>
                    </div>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-[#D5C2B4] pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>GST INCLUDED (10%):</span>
                  <span>${(latestOrder.total * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>${latestOrder.total.toFixed(2)} AUD</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-zinc-400 pt-2">
                THANK YOU FOR YOUR CRAFT ORDER!
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-[#5B3E31] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[#432C22] transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Thermal Receipt / Save PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}