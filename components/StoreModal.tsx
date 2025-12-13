import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Coins, Briefcase, CreditCard, Tag, AlertCircle, Zap, TrendingUp, Stamp, Ticket, Smartphone, Landmark } from 'lucide-react';
import Button from './Button';
import { GermanLevel, UserProfile } from '../types';

interface StoreModalProps {
  onClose: () => void;
  onPurchaseLevel: (level: GermanLevel, tokensRedeemed: number) => void;
  user: UserProfile;
  initialLevel?: GermanLevel | null;
}

type StoreView = 'CATALOGUE' | 'CHECKOUT' | 'SUCCESS';

const StoreModal: React.FC<StoreModalProps> = ({ onClose, onPurchaseLevel, user, initialLevel }) => {
  const [view, setView] = useState<StoreView>(initialLevel ? 'CHECKOUT' : 'CATALOGUE');
  const [selectedLevel, setSelectedLevel] = useState<GermanLevel | null>(initialLevel || null);
  const [processing, setProcessing] = useState(false);
  
  // INDIA MARKET DEFAULT
  // We default to INR as the primary strategy.
  const [currency, setCurrency] = useState({ code: 'INR', symbol: '₹', rate: 1 });
  
  // Pricing Strategy: Purchasing Power Parity (PPP)
  // USD -> INR conversion is too high. We use fixed price points for India.
  // A1 (Starter): ₹1,499
  // Full Levels: ₹2,999
  const getPrice = (level: GermanLevel) => {
    if (currency.code === 'INR') {
        return level === GermanLevel.A1 ? 1499.00 : 2999.00;
    }
    // Fallback for International (if we ever switch back)
    return level === GermanLevel.A1 ? 50.00 : 100.00;
  };
  
  // 1 Token = ₹1 Discount
  const VALUE_PER_TOKEN = currency.code === 'INR' ? 1.0 : 0.01;

  // DYNAMIC PRICING: Engagement Bonus
  const getDiscountLimit = () => {
    if (user.streak >= 30) return 0.30;
    if (user.streak >= 7) return 0.25;
    return 0.20;
  };
  const DISCOUNT_LIMIT_PERCENT = getDiscountLimit();

  // Selected Level Price Calculation
  const currentBasePrice = selectedLevel ? getPrice(selectedLevel) : 0;
  const maxDiscountAmount = currentBasePrice * DISCOUNT_LIMIT_PERCENT; 
  const maxTokensForDiscount = Math.floor(maxDiscountAmount / VALUE_PER_TOKEN);
  
  const [tokensToUse, setTokensToUse] = useState(0);

  // Reset tokens when level changes
  useEffect(() => {
    setTokensToUse(0);
  }, [selectedLevel]);

  const maxUsableTokens = Math.min(user.credits, maxTokensForDiscount);
  const isCappedByPolicy = maxTokensForDiscount < user.credits;

  const calculateTotal = () => {
    if (!selectedLevel) return { finalPrice: "0.00", discount: "0.00", percentOff: 0, rawFinal: 0 };
    
    const base = getPrice(selectedLevel);
    const discountAmount = tokensToUse * VALUE_PER_TOKEN;
    const final = Math.max(0, base - discountAmount);
    return {
      finalPrice: final.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      discount: discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      percentOff: Math.round((discountAmount / base) * 100),
      rawFinal: final
    };
  };

  const handleCheckout = () => {
    if (!selectedLevel) return;
    setProcessing(true);
    
    // Simulate API Transaction
    setTimeout(() => {
      onPurchaseLevel(selectedLevel, tokensToUse);
      setProcessing(false);
      setView('SUCCESS');
    }, 2000);
  };

  const formatCurrency = (val: number) => {
     return `${currency.symbol}${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const levelsForSale = [GermanLevel.A1, GermanLevel.A2, GermanLevel.B1, GermanLevel.B2, GermanLevel.C1, GermanLevel.C2];

  // --- RENDER SUCCESS VIEW ---
  if (view === 'SUCCESS') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-fade-in">
         <div className="bg-white w-full max-w-md relative shadow-2xl rounded-xl overflow-hidden text-center p-8 border-t-8 border-[#059669]">
            <div className="mb-6 flex justify-center">
               <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-[#059669] animate-bounce">
                  <Stamp size={48} />
               </div>
            </div>
            
            <h2 className="text-3xl font-display font-bold text-stone-800 mb-2">Payment Confirmed</h2>
            <p className="text-stone-500 mb-8">
               Your passport has been stamped. <br/>
               <span className="font-bold text-stone-800">Level {selectedLevel} is now unlocked.</span>
            </p>

            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mb-8 flex items-center justify-between text-sm">
               <span className="text-stone-500">Transaction ID</span>
               <span className="font-mono font-bold text-stone-400">#UPI-{Date.now().toString().slice(-6)}</span>
            </div>

            <Button onClick={onClose} className="w-full py-4 text-lg">
               Start Journey
            </Button>
         </div>
      </div>
    );
  }

  // --- RENDER CHECKOUT VIEW ---
  if (view === 'CHECKOUT' && selectedLevel) {
    const { finalPrice, discount, percentOff, rawFinal } = calculateTotal();
    const basePrice = getPrice(selectedLevel);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white w-full max-w-lg relative shadow-2xl rounded-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-stone-800 p-6 flex justify-between items-center text-white">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <CreditCard size={20} /> Secure Checkout
            </h2>
            <button 
              onClick={() => { setView('CATALOGUE'); setSelectedLevel(null); }} 
              className="text-stone-400 hover:text-white bg-stone-700 rounded-full p-1"
            >
               <X size={18} />
            </button>
          </div>

          <div className="p-8 bg-stone-50">
             {/* Summary */}
             <div className="flex items-start gap-4 mb-8 bg-white p-4 rounded-lg border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-5 text-stone-900"><Ticket size={80}/></div>
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600 relative z-10">
                   <Briefcase size={32} />
                </div>
                <div className="flex-1 relative z-10">
                   <h3 className="font-bold text-lg text-stone-800">German Level {selectedLevel}</h3>
                   <p className="text-sm text-stone-500">
                     {selectedLevel === GermanLevel.A1 ? 'Upgrade to Full Level' : '12 Missions • Full Access'}
                   </p>
                </div>
                <div className="text-right relative z-10">
                   <div className="text-xl font-bold text-stone-800">{formatCurrency(basePrice)}</div>
                </div>
             </div>

             {/* Discount Slider */}
             <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1">
                     <Tag size={12} /> Scholarship Credits
                   </label>
                   <div className="text-right">
                      <span className="text-xs font-bold text-amber-600 flex items-center justify-end gap-1">
                        <Coins size={12} /> Balance: {user.credits}
                      </span>
                   </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-inner">
                   {user.credits === 0 ? (
                     <p className="text-sm text-stone-500 italic text-center py-2">
                       Earn credits to unlock discounts. Keep learning!
                     </p>
                   ) : (
                     <>
                        <div className="flex justify-between text-sm mb-4">
                           <span className="text-stone-600">Apply Credits</span>
                           <span className="font-bold text-[#059669]">
                             {tokensToUse} Credits (-{currency.symbol}{discount})
                           </span>
                        </div>
                        <input 
                           type="range" 
                           min="0" 
                           max={maxUsableTokens} 
                           step="10" 
                           value={tokensToUse}
                           onChange={(e) => setTokensToUse(Number(e.target.value))}
                           className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#059669] mb-2"
                        />
                        <div className="flex justify-between text-xs text-stone-400">
                           <span>0</span>
                           <span className="flex items-center gap-2">
                             {user.streak >= 7 && (
                                <span className="text-amber-500 font-bold flex items-center gap-1" title="Streak Bonus Active">
                                  <Zap size={10} /> Streak Bonus
                                </span>
                             )}
                             {tokensToUse === maxUsableTokens && isCappedByPolicy && (
                               <span className="text-stone-500 font-bold flex items-center gap-1">
                                 <AlertCircle size={10} /> Max {DISCOUNT_LIMIT_PERCENT * 100}% Limit
                               </span>
                             )}
                             {percentOff}% Off
                           </span>
                        </div>
                     </>
                   )}
                </div>
             </div>
            
             {/* Payment Methods (UPI Focus) */}
             <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Payment Method</label>
                <div className="flex gap-2">
                   <div className="flex-1 border-2 border-[#059669] bg-green-50 p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                      <Smartphone size={18} className="text-[#059669]" />
                      <span className="font-bold text-stone-800 text-sm">UPI / GPay</span>
                   </div>
                   <div className="flex-1 border border-stone-200 bg-white p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer opacity-50">
                      <CreditCard size={18} className="text-stone-400" />
                      <span className="font-bold text-stone-400 text-sm">Card</span>
                   </div>
                   <div className="flex-1 border border-stone-200 bg-white p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer opacity-50">
                      <Landmark size={18} className="text-stone-400" />
                      <span className="font-bold text-stone-400 text-sm">NetBanking</span>
                   </div>
                </div>
             </div>

             {/* Total */}
             <div className="border-t border-stone-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                   <span className="font-display font-bold text-xl text-stone-800">Total Due</span>
                   <div className="text-right">
                      {tokensToUse > 0 && (
                        <span className="block text-xs text-stone-400 line-through mr-1">{formatCurrency(basePrice)}</span>
                      )}
                      <span className="font-display font-bold text-3xl text-[#059669]">
                        {rawFinal === 0 ? 'FREE' : `${currency.symbol}${finalPrice}`}
                      </span>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <Button onClick={handleCheckout} className="w-full py-4 text-lg" disabled={processing}>
                   {processing ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Verifying UPI...</span>
                   ) : (
                      `Pay ${rawFinal === 0 ? '' : currency.symbol}${finalPrice}`
                   )}
                </Button>
                <button 
                  onClick={() => { setView('CATALOGUE'); setSelectedLevel(null); }} 
                  className="w-full text-center text-stone-500 text-sm hover:text-stone-800"
                >
                   Cancel
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER CATALOGUE VIEW ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl relative shadow-2xl rounded-lg overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 z-10 bg-white rounded-full p-1">
          <X size={20} />
        </button>
        
        {/* Left: Branding */}
        <div className="w-full md:w-1/3 bg-stone-800 p-8 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
           <div>
              <h2 className="text-3xl font-display mb-4 text-amber-400">Travel Shop</h2>
              <p className="text-stone-300 text-sm leading-relaxed mb-6">
                 Purchase travel permits (levels) to continue your journey through Germany.
              </p>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                 <h4 className="font-bold text-amber-400 text-xs uppercase tracking-widest mb-2">Student Wallet</h4>
                 <div className="flex items-center gap-2 text-3xl font-bold">
                    <Coins /> {user.credits}
                 </div>
                 <p className="text-[10px] text-stone-300 mt-2">
                   Current Discount Cap: <span className="text-white font-bold">{DISCOUNT_LIMIT_PERCENT * 100}%</span>
                 </p>
                 
                 {user.streak < 30 ? (
                    <div className="mt-2 text-[10px] text-stone-400 flex items-start gap-1">
                       <TrendingUp size={12} className="shrink-0 text-[#059669]" />
                       <span>
                          Reach {user.streak < 7 ? '7' : '30'} day streak to unlock {user.streak < 7 ? '25%' : '30%'} off!
                       </span>
                    </div>
                 ) : (
                    <div className="mt-2 text-[10px] text-[#059669] flex items-start gap-1 font-bold">
                       <Zap size={12} className="shrink-0" />
                       <span>Max Streak Bonus Active!</span>
                    </div>
                 )}
              </div>
           </div>
           
           <div className="mt-8 text-xs text-stone-500">
              Prices optimized for India region.
           </div>
        </div>

        {/* Right: Items */}
        <div className="w-full md:w-2/3 p-6 md:p-8 bg-stone-50 overflow-y-auto">
           <div className="mb-6">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Available Regions</h3>
              <div className="grid grid-cols-1 gap-4">
                 {levelsForSale.map(level => {
                    const isOwned = user.ownedLevels.includes(level);
                    const levelPrice = getPrice(level);
                    
                    return (
                       <div key={level} className={`bg-white border rounded-lg p-4 flex items-center justify-between shadow-sm transition-all ${isOwned ? 'border-green-200 bg-green-50' : 'border-stone-200 hover:border-blue-400'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-full ${isOwned ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                <Briefcase size={24} />
                             </div>
                             <div>
                                <h3 className="font-bold text-stone-800 text-lg">Level {level}</h3>
                                <p className="text-xs text-stone-500">
                                   {level === GermanLevel.A1 ? '12 Missions (6 Free)' : '12 Missions • Full Access'}
                                </p>
                             </div>
                          </div>
                          
                          {isOwned ? (
                             <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 size={14} /> Owned
                             </div>
                          ) : (
                             <div className="text-right">
                               <Button 
                                  variant="secondary" 
                                  onClick={() => { setSelectedLevel(level); setView('CHECKOUT'); }}
                               >
                                  Buy {formatCurrency(levelPrice)}
                               </Button>
                               {user.credits > 0 && (
                                 <div className="text-[10px] text-[#059669] font-bold mt-1 flex justify-end items-center gap-1">
                                   <Tag size={10} /> Scholarship Available
                                 </div>
                               )}
                             </div>
                          )}
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StoreModal;