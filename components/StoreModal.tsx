import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, Coins, Briefcase, CreditCard, Tag, AlertCircle } from 'lucide-react';
import Button from './Button';
import { GermanLevel, UserProfile } from '../types';

interface StoreModalProps {
  onClose: () => void;
  onPurchaseLevel: (level: GermanLevel, tokensRedeemed: number) => void;
  user: UserProfile;
  initialLevel?: GermanLevel | null;
}

const StoreModal: React.FC<StoreModalProps> = ({ onClose, onPurchaseLevel, user, initialLevel }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<GermanLevel | null>(initialLevel || null);
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata') {
      // Set to Indian Rupee if in India timezone
      setCurrency({ code: 'INR', symbol: '₹', rate: 84 });
    }
  }, []);
  
  // Pricing Logic
  const BASE_PRICE_USD = 100.00;
  const BASE_PRICE = BASE_PRICE_USD * currency.rate;

  const DISCOUNT_LIMIT_PERCENT = 0.20; // Max 20% discount
  const DOLLARS_PER_TOKEN = 0.01; // 1 Token = 1 Cent USD
  const VALUE_PER_TOKEN = DOLLARS_PER_TOKEN * currency.rate; 
  
  // Calculate constraints
  const maxDiscountAmount = BASE_PRICE * DISCOUNT_LIMIT_PERCENT; 
  const maxTokensForDiscount = Math.floor(maxDiscountAmount / VALUE_PER_TOKEN);
  
  const [tokensToUse, setTokensToUse] = useState(0);

  // Reset tokens when level changes
  useEffect(() => {
    setTokensToUse(0);
  }, [selectedLevel]);

  // The max tokens the user CAN use is the lower of: their balance OR the 20% cap
  const maxUsableTokens = Math.min(user.credits, maxTokensForDiscount);
  const isCappedByPolicy = maxTokensForDiscount < user.credits;

  const calculateTotal = () => {
    const discountAmount = tokensToUse * VALUE_PER_TOKEN;
    const final = Math.max(0, BASE_PRICE - discountAmount);
    return {
      finalPrice: final.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      discount: discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      percentOff: Math.round((discountAmount / BASE_PRICE) * 100),
      rawFinal: final
    };
  };

  const handleCheckout = () => {
    if (!selectedLevel) return;
    setProcessing(true);
    // Simulate API call to Stripe/Payment Gateway
    setTimeout(() => {
      onPurchaseLevel(selectedLevel, tokensToUse);
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 1500);
  };

  // Levels to show in store
  const levelsForSale = [GermanLevel.A2, GermanLevel.B1, GermanLevel.B2, GermanLevel.C1, GermanLevel.C2];

  const formatCurrency = (val: number) => {
     return `${currency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // If a level is selected, show checkout view
  if (selectedLevel) {
    const { finalPrice, discount, percentOff } = calculateTotal();
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white w-full max-w-lg relative shadow-2xl rounded-xl overflow-hidden flex flex-col">
          {/* Checkout Header */}
          <div className="bg-stone-800 p-6 flex justify-between items-center text-white">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <CreditCard size={20} /> Checkout
            </h2>
            <button onClick={onClose} className="text-stone-400 hover:text-white bg-stone-700 rounded-full p-1">
               <X size={18} />
            </button>
          </div>

          <div className="p-8 bg-stone-50">
             
             {/* Product Summary */}
             <div className="flex items-start gap-4 mb-8 bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                   <Briefcase size={32} />
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-lg text-stone-800">German Level {selectedLevel}</h3>
                   <p className="text-sm text-stone-500">Full Access • 6 Story Missions</p>
                </div>
                <div className="text-right">
                   <div className="text-xl font-bold text-stone-800">{formatCurrency(BASE_PRICE)}</div>
                </div>
             </div>

             {/* Discount Section */}
             <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1">
                     <Tag size={12} /> Student Scholarship
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
                           <span className="flex items-center gap-1">
                             {tokensToUse === maxUsableTokens && isCappedByPolicy && (
                               <span className="text-amber-500 font-bold flex items-center gap-1">
                                 <AlertCircle size={10} /> Max 20% Limit Reached
                               </span>
                             )}
                             {percentOff}% Off
                           </span>
                        </div>
                     </>
                   )}
                </div>
             </div>

             {/* Total */}
             <div className="border-t border-stone-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                   <span className="font-display font-bold text-xl text-stone-800">Total Due</span>
                   <div className="text-right">
                      {tokensToUse > 0 && (
                        <span className="block text-xs text-stone-400 line-through mr-1">{formatCurrency(BASE_PRICE)}</span>
                      )}
                      <span className="font-display font-bold text-3xl text-[#059669]">{currency.symbol}{finalPrice}</span>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <Button onClick={handleCheckout} className="w-full py-4 text-lg" disabled={processing}>
                   {processing ? <Loader2 className="animate-spin" /> : `Pay ${currency.symbol}${finalPrice}`}
                </Button>
                <button onClick={() => setSelectedLevel(null)} className="w-full text-center text-stone-500 text-sm hover:text-stone-800">
                   Cancel
                </button>
             </div>
             
             <p className="text-center text-[10px] text-stone-400 mt-4">
                Secure Payment processed by Stripe. Credits redeemed as immediate discount.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // Catalogue View
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
                   Redeem for up to <span className="text-white font-bold">20% off</span> at checkout.
                 </p>
              </div>
           </div>
        </div>

        {/* Right: Items */}
        <div className="w-full md:w-2/3 p-6 md:p-8 bg-stone-50 overflow-y-auto">
           <div className="mb-6">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Available Regions</h3>
              <div className="grid grid-cols-1 gap-4">
                 {levelsForSale.map(level => {
                    const isOwned = user.ownedLevels.includes(level);
                    return (
                       <div key={level} className={`bg-white border rounded-lg p-4 flex items-center justify-between shadow-sm transition-all ${isOwned ? 'border-green-200 bg-green-50' : 'border-stone-200 hover:border-blue-400'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-full ${isOwned ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                <Briefcase size={24} />
                             </div>
                             <div>
                                <h3 className="font-bold text-stone-800 text-lg">Level {level}</h3>
                                <p className="text-xs text-stone-500">6 Missions • Grammar & Culture</p>
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
                                  onClick={() => setSelectedLevel(level)}
                               >
                                  Buy {formatCurrency(BASE_PRICE)}
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