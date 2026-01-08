
import React, { useState, useEffect } from 'react';
import { Client, ServiceItem } from '../types';

interface InvoicePageProps {
  clients: Client[];
  services: ServiceItem[];
  invCounter: number;
  onProcessPayment: (receiptData: any) => void;
}

interface InvoiceLineItem {
  name: string;
  price: number;
  quantity: number;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ clients, services, invCounter, onProcessPayment }) => {
  const [invNo, setInvNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [currentItems, setCurrentItems] = useState<InvoiceLineItem[]>([]);
  
  useEffect(() => {
    const year = new Date().getFullYear();
    setInvNo(`RES-${year}${String(invCounter).padStart(4, '0')}`);
  }, [invCounter]);

  const addItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const item = JSON.parse(val) as ServiceItem;
    setCurrentItems([...currentItems, { name: item.name, price: item.price, quantity: 1 }]);
    e.target.value = ""; // Reset select
  };

  const updateItem = (idx: number, field: keyof InvoiceLineItem, value: string | number) => {
    const newItems = [...currentItems];
    if (field === 'price') {
      newItems[idx].price = parseFloat(value.toString()) || 0;
    } else if (field === 'quantity') {
      newItems[idx].quantity = parseInt(value.toString()) || 0;
    } else if (field === 'name') {
      newItems[idx].name = value.toString();
    }
    setCurrentItems(newItems);
  };

  const removeItem = (idx: number) => {
    setCurrentItems(currentItems.filter((_, i) => i !== idx));
  };

  const total = currentItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  const handlePrint = () => {
    if (!selectedCustomer) return alert("Sila pilih pelanggan!");
    if (currentItems.length === 0) return alert("Tambah sekurang-kurangnya 1 item!");

    onProcessPayment({
      title: "RESIT RASMI",
      customer: selectedCustomer,
      docNo: invNo,
      date: date,
      // Map items to final prices (price * quantity) for compatibility with Receipt component
      // while keeping the description detailed if quantity > 1
      items: currentItems.map(it => ({
        name: it.quantity > 1 ? `${it.name} (x${it.quantity})` : it.name,
        price: it.price * it.quantity
      })),
      total: total
    });

    setCurrentItems([]);
    setSelectedCustomer('');
  };

  return (
    <div className="bg-white text-black p-6 md:p-10 rounded-2xl shadow-2xl border border-gray-200 animate-slideUp">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-black text-[#FFD700] p-3 rounded-xl shadow-lg">
            <i className="fas fa-file-invoice text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Penyediaan Resit</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Official Legal Receipt Generation</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-gray-400 uppercase block">No. Dokumen</span>
          <span className="text-xl font-black tracking-tighter">{invNo}</span>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase text-gray-400 ml-1">Tarikh Dokumen</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl focus:border-black focus:bg-white outline-none transition-all font-bold" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase text-gray-400 ml-1">Pilih Pelanggan / Fail</label>
          <select 
            value={selectedCustomer} 
            onChange={e => setSelectedCustomer(e.target.value)}
            className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl focus:border-black focus:bg-white outline-none transition-all font-bold appearance-none cursor-pointer"
          >
            <option value="">-- Pilih Pelanggan --</option>
            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            <option value="PELANGGAN TUNAI" className="font-black text-blue-600">PELANGGAN TUNAI (CASH)</option>
          </select>
        </div>
      </div>

      {/* Item Selection Section */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-100">
        <label className="block text-[10px] font-black uppercase mb-3 text-gray-500 tracking-widest text-center">Tambah Perkhidmatan Ke Dalam Senarai</label>
        <div className="relative max-w-2xl mx-auto">
          <select 
            onChange={addItem}
            className="w-full border-2 border-black bg-white p-4 rounded-xl focus:ring-4 focus:ring-black/5 outline-none font-bold text-lg cursor-pointer shadow-md"
          >
            <option value="">+ KLIK UNTUK PILIH PERKHIDMATAN</option>
            {services.map(s => (
              <option key={s.id} value={JSON.stringify(s)}>
                {s.name} — RM {s.price.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Table Section */}
      <div className="mb-10 overflow-hidden border-2 border-black rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4 text-xs font-black uppercase tracking-widest">Butiran Pembayaran</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-center w-24">Unit</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-right w-32">Harga (RM)</th>
              <th className="p-4 text-xs font-black uppercase tracking-widest text-right w-32">Jumlah (RM)</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-gray-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center opacity-20">
                    <i className="fas fa-box-open text-6xl mb-4"></i>
                    <p className="font-black uppercase tracking-tighter">Senarai item masih kosong</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((it, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <span className="text-[10px] font-black text-gray-300 block mb-0.5">Item #{idx + 1}</span>
                    <input 
                      type="text" 
                      value={it.name}
                      onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      className="w-full font-black text-lg uppercase leading-tight bg-transparent border-b border-transparent focus:border-black outline-none"
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-full border-2 border-gray-100 bg-white p-2 rounded-lg text-center font-bold focus:border-black outline-none"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <input 
                      type="number" 
                      step="0.01"
                      value={it.price}
                      onChange={(e) => updateItem(idx, 'price', e.target.value)}
                      className="w-full border-2 border-gray-100 bg-white p-2 rounded-lg text-right font-bold focus:border-black outline-none"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-black text-xl tracking-tighter">
                      RM {(it.price * it.quantity).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => removeItem(idx)} 
                      className="w-8 h-8 flex items-center justify-center text-red-200 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      title="Buang Item"
                    >
                      <i className="fas fa-trash-can text-sm"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 pt-6 border-t-2 border-gray-100">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-6">
            <div className="h-10 w-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
              <i className="fas fa-coins text-black text-xl"></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700] mb-1">Jumlah Keseluruhan</p>
              <h3 className="text-4xl font-black tracking-tighter tabular-nums">
                RM {total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          disabled={currentItems.length === 0}
          className={`
            px-12 py-6 rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 uppercase tracking-tighter transition-all transform
            ${currentItems.length === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed grayscale' 
              : 'bg-black text-white hover:bg-gray-900 active:scale-95 hover:shadow-black/20 hover:-translate-y-1'
            }
          `}
        >
          <i className="fas fa-print"></i>
          Sahkan & Cetak Resit
        </button>
      </div>
    </div>
  );
};

export default InvoicePage;
