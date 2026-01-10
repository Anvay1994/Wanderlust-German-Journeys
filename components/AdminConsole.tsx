import React, { useEffect, useMemo, useState } from 'react';
import { 
  LayoutDashboard, Users, CreditCard, TrendingUp, Bell, Search, 
  ArrowLeft, Download, DollarSign, Activity, Globe, ShieldAlert, IndianRupee 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import Button from './Button';
import { GermanLevel } from '../types';

interface AdminConsoleProps {
  onExit: () => void;
  adminToken?: string | null;
}

// --- MOCK DATA GENERATORS (INR) ---
const generateRevenueData = () => [
  { name: 'Mon', revenue: 15000, sales: 5 },
  { name: 'Tue', revenue: 25000, sales: 9 },
  { name: 'Wed', revenue: 18000, sales: 7 },
  { name: 'Thu', revenue: 42000, sales: 14 },
  { name: 'Fri', revenue: 35000, sales: 11 },
  { name: 'Sat', revenue: 75000, sales: 25 },
  { name: 'Sun', revenue: 60000, sales: 20 },
];

const salesByLevelData = [
  { name: 'A1 (₹1499)', value: 55, color: '#059669' },
  { name: 'A2 (₹2999)', value: 25, color: '#3b82f6' },
  { name: 'B1 (₹2999)', value: 15, color: '#8b5cf6' },
  { name: 'B2+ (₹2999)', value: 5, color: '#d97706' },
];

const generateUserTable = () => {
  const names = ["Rohan M.", "Priya S.", "Ananya G.", "Vikram R.", "Arjun K.", "Sneha T.", "Rahul P.", "Meera J."];
  const levels = Object.values(GermanLevel);
  
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `USR-${1000 + i}`,
    name: names[i],
    level: levels[Math.floor(Math.random() * levels.length)],
    spent: Math.random() > 0.5 ? 2999 : 1499,
    lastActive: `${Math.floor(Math.random() * 5)}h ago`,
    status: Math.random() > 0.2 ? 'Active' : 'Churned'
  }));
};

const AdminConsole: React.FC<AdminConsoleProps> = ({ onExit, adminToken }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'finance'>('dashboard');
  const [userList] = useState(generateUserTable());
  const [metrics, setMetrics] = useState<{ totalRevenue: number; activeStudents: number; newSignups: number; revenueByLevel: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!adminToken) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/metrics', {
          headers: { 'x-admin-token': adminToken }
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          setError(json?.error || 'Failed to load metrics');
        } else {
          setMetrics({
            totalRevenue: json.totalRevenue || 0,
            activeStudents: json.activeStudents || 0,
            newSignups: json.newSignups || 0,
            revenueByLevel: json.revenueByLevel || {}
          });
        }
      } catch (e: any) {
        setError(e?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [adminToken]);

  const revenueChartData = useMemo(() => {
    if (!metrics?.revenueByLevel) return salesByLevelData;
    const entries = Object.entries(metrics.revenueByLevel);
    if (entries.length === 0) return salesByLevelData;
    const palette = ['#059669', '#3b82f6', '#8b5cf6', '#d97706', '#14b8a6'];
    return entries.map(([name, value], idx) => ({
      name,
      value,
      color: palette[idx % palette.length]
    }));
  }, [metrics]);

  const KPICard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-start justify-between">
      <div>
        <h3 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-2xl font-display font-bold text-stone-800 mb-1">{value}</div>
        <div className={`text-xs font-bold ${sub.includes('+') ? 'text-emerald-600' : 'text-red-500'}`}>
          {sub} vs last week
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={20} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100 flex font-sans text-stone-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-stone-800">
          <h1 className="font-display font-bold text-xl flex items-center gap-2">
            <ShieldAlert className="text-emerald-500" /> Admin
          </h1>
          <p className="text-xs text-stone-500 mt-1">Wanderlust Control Center</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#059669] text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
             onClick={() => setActiveTab('users')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-[#059669] text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <Users size={18} /> Students
          </button>
          <button 
             onClick={() => setActiveTab('finance')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'finance' ? 'bg-[#059669] text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <IndianRupee size={18} /> Revenue
          </button>
        </nav>

        <div className="p-4 border-t border-stone-800">
           <button onClick={onExit} className="flex items-center gap-2 text-stone-400 hover:text-white text-sm w-full px-4 py-2">
             <ArrowLeft size={16} /> Return to App
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white h-16 border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold capitalize">{activeTab} Overview</h2>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-stone-400" size={16} />
                <input type="text" placeholder="Search data..." className="pl-9 pr-4 py-2 bg-stone-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" />
             </div>
             <button className="p-2 text-stone-400 hover:text-stone-800 relative">
               <Bell size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <div className="w-8 h-8 bg-stone-800 rounded-full flex items-center justify-center text-white font-bold text-xs">A</div>
          </div>
        </header>

        <div className="p-8 space-y-8 animate-fade-in">
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
             <>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard title="Total Revenue" value={`₹${(metrics?.totalRevenue || 0).toLocaleString('en-IN')}`} sub={metrics ? '' : 'Live'} icon={IndianRupee} color="bg-emerald-500" />
                  <KPICard title="Active Students" value={(metrics?.activeStudents ?? 0).toLocaleString('en-IN')} sub={metrics ? '' : 'Live'} icon={Users} color="bg-blue-500" />
                  <KPICard title="Avg. Session" value="--" sub="(not tracked)" icon={Activity} color="bg-amber-500" />
                  <KPICard title="New Signups" value={(metrics?.newSignups ?? 0).toLocaleString('en-IN')} sub={metrics ? '' : 'Live'} icon={Globe} color="bg-purple-500" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-stone-800">Revenue Trends (INR)</h3>
                        <Button size="sm" variant="secondary"><Download size={14}/> Report</Button>
                     </div>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={generateRevenueData()}>
                              <defs>
                                 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716c'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#78716c'}} />
                              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                              <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                     <h3 className="font-bold text-stone-800 mb-6">Sales by Level</h3>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie 
                                 data={revenueChartData} 
                                 innerRadius={60} 
                                 outerRadius={80} 
                                 paddingAngle={5} 
                                 dataKey="value"
                              >
                                 {revenueChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="space-y-2 mt-4">
                        {revenueChartData.map(item => (
                           <div key={item.name} className="flex justify-between text-sm">
                              <span className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                 {item.name}
                              </span>
                              <span className="font-bold">₹{(item.value || 0).toLocaleString('en-IN')}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
             </>
          )}

          {/* USERS VIEW */}
          {activeTab === 'users' && (
             <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-widest font-bold border-b border-stone-200">
                      <tr>
                         <th className="p-4">User</th>
                         <th className="p-4">Current Level</th>
                         <th className="p-4">Total Spent</th>
                         <th className="p-4">Last Active</th>
                         <th className="p-4">Status</th>
                         <th className="p-4 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-100 text-sm">
                      {userList.map(u => (
                         <tr key={u.id} className="hover:bg-stone-50">
                            <td className="p-4 font-bold text-stone-800">{u.name} <div className="text-xs text-stone-400 font-normal">{u.id}</div></td>
                            <td className="p-4"><span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-bold">{u.level}</span></td>
                            <td className="p-4 font-mono">₹{u.spent}</td>
                            <td className="p-4 text-stone-500">{u.lastActive}</td>
                            <td className="p-4">
                               <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                  {u.status}
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               <button className="text-stone-400 hover:text-stone-800 font-bold text-xs">MANAGE</button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {/* FINANCE VIEW */}
          {activeTab === 'finance' && (
             <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm text-center py-20">
                <CreditCard size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-xl font-bold text-stone-800">Razorpay / Stripe Status</h3>
                <p className="text-stone-500 max-w-md mx-auto mt-2">
                   Live payments are currently simulated. In production, this section would display real-time webhooks from your payment gateway (UPI/Cards).
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                   <div className="p-4 border border-stone-200 rounded-lg">
                      <div className="text-xs text-stone-400 uppercase tracking-widest font-bold">Today</div>
                      <div className="text-2xl font-display font-bold text-emerald-600">₹12,450</div>
                   </div>
                   <div className="p-4 border border-stone-200 rounded-lg">
                      <div className="text-xs text-stone-400 uppercase tracking-widest font-bold">MTD</div>
                      <div className="text-2xl font-display font-bold text-stone-800">₹2,84,000</div>
                   </div>
                   <div className="p-4 border border-stone-200 rounded-lg">
                      <div className="text-xs text-stone-400 uppercase tracking-widest font-bold">ARR (Est)</div>
                      <div className="text-2xl font-display font-bold text-stone-800">₹32L</div>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminConsole;
