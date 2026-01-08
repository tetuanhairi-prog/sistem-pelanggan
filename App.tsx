import React, { useState, useEffect } from 'react';
import { PageId, AppState, Client, PjsRecord, ServiceItem, LedgerEntry } from './types';
import { loadFromStorage, saveToStorage } from './services/storageService';
import { syncToSheets } from './services/syncService';
import Navbar from './components/Navbar';
import Header from './components/Header';
import GuamanPage from './components/GuamanPage';
import PjsPage from './components/PjsPage';
import InventoryPage from './components/InventoryPage';
import InvoicePage from './components/InvoicePage';
import Receipt from './components/Receipt';

const App: React.FC = () => {
  // Use lazy initialization for performance and reliable persistence on refresh
  const [state, setState] = useState<AppState>(() => loadFromStorage());
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isClosingLedger, setIsClosingLedger] = useState(false);

  // Automatically save state to storage whenever it changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addClient = (client: Omit<Client, 'id' | 'ledger'>, initialFee: number) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      ledger: [{
        date: new Date().toISOString().split('T')[0],
        desc: "FEE PROFESSIONAL DIPERSETUJUI",
        amt: initialFee
      }]
    };
    updateState({ clients: [...state.clients, newClient] });
    syncToSheets({ type: "GUAMAN", name: newClient.name, detail: newClient.detail, balance: initialFee });
  };

  const addPjsRecord = (record: Omit<PjsRecord, 'id'>) => {
    const newRecord: PjsRecord = { ...record, id: crypto.randomUUID() };
    updateState({ pjsRecords: [newRecord, ...state.pjsRecords] });
    syncToSheets({ type: "PJS", ...newRecord });
  };

  const deleteClient = (id: string) => {
    const newClients = state.clients.filter(c => c.id !== id);
    // Reset active index if the client list changes significantly to prevent UI bugs
    updateState({ 
      clients: newClients,
      activeClientIdx: null 
    });
  };

  const deletePjsRecord = (id: string) => updateState({ pjsRecords: state.pjsRecords.filter(r => r.id !== id) });
  const deleteService = (id: string) => updateState({ inventory: state.inventory.filter(s => s.id !== id) });

  const addService = (service: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = { ...service, id: crypto.randomUUID() };
    updateState({ inventory: [...state.inventory, newService] });
  };

  const updateLedger = (clientIdx: number, newEntry: LedgerEntry) => {
    const newClients = [...state.clients];
    if (newClients[clientIdx]) {
      newClients[clientIdx].ledger.push(newEntry);
      updateState({ clients: newClients });
    }
  };

  const deleteLedgerEntry = (clientIdx: number, entryIdx: number) => {
    const newClients = [...state.clients];
    if (newClients[clientIdx]) {
      newClients[clientIdx].ledger.splice(entryIdx, 1);
      updateState({ clients: newClients });
    }
  };

  // Helper functions for state updates that trigger persistence
  const setCurrentPage = (page: PageId) => updateState({ currentPage: page });
  
  const handleCloseLedger = () => {
    setIsClosingLedger(true);
    // Wait for the exit animation to complete before removing from DOM
    setTimeout(() => {
      updateState({ activeClientIdx: null });
      setIsClosingLedger(false);
    }, 300);
  };

  const setOpenLedger = (idx: number) => {
    setIsClosingLedger(false);
    updateState({ activeClientIdx: idx });
  };

  const { currentPage, activeClientIdx, clients, pjsRecords, inventory, invCounter, firmLogo } = state;
  
  // The ledger shows if we have a valid index AND we are on the guaman page
  const showLedger = currentPage === 'guaman' && activeClientIdx !== null && activeClientIdx < clients.length;

  return (
    <div className="min-h-screen pb-10">
      <div className="max-w-6xl mx-auto px-4 py-8 no-print">
        <div className="bg-[#111] rounded-xl border border-[#333] shadow-2xl overflow-hidden">
          <Header logo={firmLogo} onLogoChange={(logo) => updateState({ firmLogo: logo })} />
          <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
          
          <main className="p-6 md:p-10">
            {currentPage === 'guaman' && (
              <GuamanPage 
                clients={clients} 
                onAdd={addClient} 
                onDelete={deleteClient}
                onOpenLedger={setOpenLedger}
                onImport={(data) => updateState({ clients: data, activeClientIdx: null })}
              />
            )}
            {currentPage === 'pjs' && (
              <PjsPage 
                records={pjsRecords} 
                onAdd={addPjsRecord} 
                onDelete={deletePjsRecord}
                onImport={(data) => updateState({ pjsRecords: data })}
              />
            )}
            {currentPage === 'inventory' && (
              <InventoryPage 
                services={inventory} 
                onAdd={addService} 
                onDelete={deleteService}
                onImport={(data) => updateState({ inventory: data })}
              />
            )}
            {currentPage === 'invoice' && (
              <InvoicePage 
                clients={clients} 
                services={inventory} 
                invCounter={invCounter}
                onProcessPayment={(receipt) => {
                  setReceiptData(receipt);
                  updateState({ invCounter: invCounter + 1 });
                }}
              />
            )}
          </main>
        </div>
      </div>

      {showLedger && activeClientIdx !== null && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 no-print ${isClosingLedger ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          <div className={`bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isClosingLedger ? 'animate-slideDown' : 'animate-slideUp'}`}>
            <div className="p-4 bg-gray-100 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-800 uppercase">FAIL: {clients[activeClientIdx].name}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const client = clients[activeClientIdx!];
                    setReceiptData({
                      title: "PENYATA AKAUN FAIL",
                      customer: client.name,
                      docNo: `STMT-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      items: client.ledger.map(t => ({ name: `${t.date} - ${t.desc}`, price: t.amt })),
                      total: client.ledger.reduce((s, t) => s + t.amt, 0),
                      isStatement: true
                    });
                  }}
                  className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-black"
                >
                  <i className="fas fa-print mr-1"></i> Penyata
                </button>
                <button onClick={handleCloseLedger} className="bg-red-600 text-white w-8 h-8 rounded flex items-center justify-center hover:bg-red-700">&times;</button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <LedgerForm onAdd={(entry) => updateLedger(activeClientIdx!, entry)} />
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                      <th className="p-2 border">Tarikh</th>
                      <th className="p-2 border">Keterangan</th>
                      <th className="p-2 border text-right">Amaun (RM)</th>
                      <th className="p-2 border w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients[activeClientIdx].ledger.map((t, i) => (
                      <tr key={i} className="text-sm border-b hover:bg-gray-50">
                        <td className="p-2 text-gray-600 whitespace-nowrap">{t.date}</td>
                        <td className="p-2 text-gray-800 font-medium uppercase">{t.desc}</td>
                        <td className={`p-2 text-right font-bold ${t.amt < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {t.amt.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button onClick={() => deleteLedgerEntry(activeClientIdx!, i)} className="text-red-500 hover:text-red-700">
                            <i className="fas fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t text-right">
              <span className="text-lg font-bold">
                Baki: 
                <span className={`ml-2 ${clients[activeClientIdx].ledger.reduce((s,t) => s + t.amt, 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  RM {clients[activeClientIdx].ledger.reduce((s,t) => s + t.amt, 0).toFixed(2)}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {receiptData && (
        <div id="receipt-print" className="fixed inset-0 z-[100] bg-white overflow-y-auto p-4 md:p-10 no-print-backdrop">
           <div className="max-w-[148mm] mx-auto">
            <Receipt data={receiptData} logo={firmLogo} onClose={() => setReceiptData(null)} />
           </div>
        </div>
      )}
    </div>
  );
};

const LedgerForm: React.FC<{ onAdd: (entry: LedgerEntry) => void }> = ({ onAdd }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amt) return alert("Isi butiran!");
    onAdd({ date, desc: desc.toUpperCase(), amt: parseFloat(amt) });
    setDesc(''); setAmt('');
  };
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded border">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tarikh</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded p-2 text-sm" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Keterangan (Caj/Bayaran)</label>
        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Contoh: Bayaran Ansuran" className="w-full border rounded p-2 text-sm" />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amaun (RM)</label>
        <div className="flex gap-2">
          <input type="number" step="0.01" value={amt} onChange={e => setAmt(e.target.value)} placeholder="500 atau -500" className="w-full border rounded p-2 text-sm" />
          <button type="submit" className="bg-[#FFD700] text-black px-4 py-2 rounded font-bold text-sm">OK</button>
        </div>
      </div>
    </form>
  );
};

export default App;