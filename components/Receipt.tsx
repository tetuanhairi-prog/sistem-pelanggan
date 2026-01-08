import React from 'react';
import { DEFAULT_LOGO } from '../constants';

interface ReceiptProps {
  data: {
    title: string;
    customer: string;
    docNo: string;
    date: string;
    items: { name: string; price: number }[];
    total: number;
    isStatement?: boolean;
  };
  logo: string | null;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ data, logo, onClose }) => {
  const displayLogo = logo || DEFAULT_LOGO;

  return (
    <div className="paper-texture text-black p-8 md:p-14 min-h-[210mm] border-[12px] border-double border-black shadow-2xl relative flex flex-col overflow-hidden">
      
      {/* Guilloche Corner Accents (Subtle SVG Pattern) */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-black">
          <circle cx="100" cy="0" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="0" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="0" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="0" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="text-gray-200/30 font-legal font-bold text-[180px] -rotate-45 uppercase select-none tracking-widest">
          {data.isStatement ? 'COPY' : 'OFFICIAL'}
        </span>
      </div>

      {/* Security Border (Microtext) */}
      <div className="absolute inset-3 border border-black/5 pointer-events-none flex flex-col justify-between p-1">
        <div className="flex justify-between text-[5px] text-black/10 uppercase tracking-[0.5em]">
          <span>Hairi Mustafa Associates • Hairi Mustafa Associates • Hairi Mustafa Associates</span>
          <span>Hairi Mustafa Associates • Hairi Mustafa Associates • Hairi Mustafa Associates</span>
        </div>
      </div>

      {/* Header section */}
      <div className="relative z-10 flex items-start justify-between border-b-2 border-black pb-8 mb-8">
        <div className="flex items-start">
          {displayLogo && (
            <div className="bg-white p-2 border border-black/10 shadow-sm mr-8">
              <img src={displayLogo} alt="Logo" className="h-24 w-auto object-contain" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-legal text-2xl md:text-3xl font-bold m-0 leading-tight uppercase tracking-tight text-gray-900">
              HAIRI MUSTAFA ASSOCIATES
            </h1>
            <p className="text-[12px] font-black m-0 uppercase tracking-[0.25em] mt-1 border-t border-black/10 pt-1 text-gray-700">
              Peguam Syarie & Pesuruhjaya Sumpah
            </p>
            <div className="mt-4 space-y-1 text-gray-600">
              <p className="text-[10px] font-semibold leading-none">Lot 02, Bangunan Arked Mara, 09100 Baling, Kedah Darul Aman</p>
              <p className="text-[10px] font-semibold leading-none">Tel: +604-470 1234 • Faks: +604-470 5678</p>
              <p className="text-[10px] font-semibold leading-none">Portal: www.hairimustafa.com.my</p>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
            <div className="bg-black text-[#FFD700] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm">
                SALINAN ASAL
            </div>
            <div className="border-2 border-black p-3 min-w-[140px] bg-white/50">
                <p className="text-[8px] font-black uppercase text-gray-400 text-center border-b border-black/20 pb-1 mb-1 tracking-widest">No. Rujukan</p>
                <p className="text-base font-black text-center tracking-tighter font-mono">{data.docNo}</p>
            </div>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mb-10">
        <h2 className="font-legal inline-block text-2xl font-bold border-b-[3px] border-black pb-1 px-12 uppercase tracking-[0.4em]">
            {data.title}
        </h2>
      </div>

      {/* Meta Info */}
      <div className="relative z-10 grid grid-cols-2 gap-12 mb-12 text-sm">
        <div className="border-l-[6px] border-black pl-6 py-1">
          <p className="text-gray-400 uppercase text-[9px] font-black mb-1.5 tracking-[0.2em] italic">Diterima Daripada / Nama Fail:</p>
          <p className="font-legal font-bold text-xl uppercase leading-tight text-gray-900 tracking-tight">{data.customer}</p>
        </div>
        <div className="text-right py-1">
          <p className="text-gray-400 uppercase text-[9px] font-black mb-1.5 tracking-[0.2em] italic text-right">Tarikh Dokumen:</p>
          <p className="font-black text-xl text-gray-900 tabular-nums">{data.date}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative z-10 flex-grow mb-10">
        <table className="w-full border-collapse border-y-2 border-black">
          <thead>
            <tr className="bg-black/5 border-b-2 border-black">
              <th className="p-4 text-left text-[11px] font-black uppercase tracking-[0.25em] border-r border-black/20 text-gray-700">
                Keterangan Perkhidmatan & Butiran Pembayaran
              </th>
              <th className="p-4 text-right text-[11px] font-black uppercase tracking-[0.25em] w-48 text-gray-700">
                Amaun (MYR)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {data.items.map((item, idx) => (
              <tr key={idx} className="group">
                <td className="p-5 border-r border-black/20">
                    <p className="font-bold text-xs uppercase tracking-wide text-gray-800 leading-relaxed">{item.name}</p>
                </td>
                <td className={`p-5 text-right font-black tabular-nums text-sm ${item.price < 0 ? 'text-green-700' : 'text-gray-900'}`}>
                  {Math.abs(item.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  {item.price < 0 ? ' (CR)' : ''}
                </td>
              </tr>
            ))}
            {/* Elegant spacing lines */}
            {Array.from({ length: Math.max(0, 6 - data.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="h-12">
                <td className="border-r border-black/20"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer Section */}
      <div className="relative z-10 grid grid-cols-2 gap-10 items-end mb-12">
        <div>
            {/* Digital Verification Area */}
            <div className="flex items-center gap-4 opacity-40 grayscale group hover:grayscale-0 transition-all">
                <div className="w-16 h-16 border-2 border-black p-1 bg-white">
                    <div className="w-full h-full bg-black/5 flex items-center justify-center text-[6px] text-center font-black">
                        DIGITAL<br/>VERIFIED<br/>QR
                    </div>
                </div>
                <div className="text-[8px] font-bold text-gray-500 uppercase leading-tight tracking-widest">
                    Penyata Digital<br/>Hairi Mustafa Associates<br/>ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </div>
            </div>
        </div>
        
        <div className="flex flex-col items-end">
            <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 min-w-[320px] text-right">
                <div className="flex justify-between items-center border-b border-black/10 pb-2 mb-3">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ringgit Malaysia</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter font-mono">CODE: MYR-INT-25</span>
                </div>
                <p className="text-[11px] font-black uppercase leading-none mb-1.5 text-gray-500 tracking-widest">
                    {data.isStatement ? 'BAKI AKHIR FAIL PELANGGAN' : 'JUMLAH BAYARAN RASMI DITERIMA'}
                </p>
                <p className="text-4xl font-black tabular-nums tracking-tighter text-gray-900">
                    RM {data.total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                </p>
            </div>
        </div>
      </div>

      {/* Terms and Conditions (Professional Microtext) */}
      <div className="relative z-10 mb-8 border-t border-black/10 pt-4">
        <p className="text-[9px] text-gray-400 font-medium text-center uppercase tracking-widest leading-relaxed">
            Resit ini adalah sah di sisi undang-undang bagi sebarang urusan mahkamah syariah atau sivil. <br/>
            Segala pembayaran adalah tertakluk kepada syarat-syarat firma yang telah dipersetujui.
        </p>
      </div>

      {/* Signature & Authentication Section */}
      <div className="relative z-10 grid grid-cols-2 gap-24 pt-8">
        <div className="text-center">
            <div className="h-20 flex flex-col items-center justify-center">
                <div className="w-32 h-px bg-gray-200"></div>
            </div>
            <div className="border-t-[1.5px] border-black pt-2 text-[10px] font-black uppercase tracking-[0.2em] font-legal italic text-gray-800">
                Tandatangan Pelanggan
            </div>
            <p className="text-[8px] text-gray-400 mt-1 uppercase font-bold">Tarikh: ..............................</p>
        </div>
        <div className="text-center relative">
            <div className="h-20 flex items-center justify-center">
               <div className="w-20 h-20 border-[3px] border-black/10 rounded-full flex items-center justify-center text-[9px] font-black text-black/10 uppercase -rotate-12 border-double">
                   COP FIRMA
               </div>
               {/* Digital Stamp Placeholder */}
               <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                   <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 10 L90 90 L10 90 Z" fill="currentColor"/></svg>
               </div>
            </div>
            <div className="border-t-[1.5px] border-black pt-2 text-[10px] font-black uppercase tracking-[0.1em] text-gray-900">
                Pengurusan Fail / Akaun Rasmi
            </div>
            <p className="text-[9px] font-bold text-black mt-1 uppercase tracking-tighter">HAIRI MUSTAFA ASSOCIATES</p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute top-6 right-6 flex gap-3 no-print">
        <button 
            onClick={() => window.print()} 
            className="bg-black text-[#FFD700] px-8 py-3 rounded-xl font-black text-xs flex items-center gap-3 hover:bg-gray-800 transition-all shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] active:scale-95 border border-white/10"
        >
          <i className="fas fa-print"></i> CETAK DOKUMEN RASMI
        </button>
        <button 
            onClick={onClose} 
            className="bg-red-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl hover:bg-red-700 shadow-xl active:scale-95 border border-red-800/20"
        >
            &times;
        </button>
      </div>
    </div>
  );
};

export default Receipt;