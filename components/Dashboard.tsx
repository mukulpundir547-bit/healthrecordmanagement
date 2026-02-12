
import React from 'react';
import { BlockchainState, User } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  chainState: BlockchainState;
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ chainState, currentUser }) => {
  // Mock data for health trends
  const trendData = [
    { name: 'Mon', value: 72 },
    { name: 'Tue', value: 75 },
    { name: 'Wed', value: 68 },
    { name: 'Thu', value: 80 },
    { name: 'Fri', value: 74 },
    { name: 'Sat', value: 71 },
    { name: 'Sun', value: 73 },
  ];

  const stats = [
    { label: 'Total Records', value: Object.values(chainState.worldState).flat().length, icon: 'fa-folder-open', color: 'bg-blue-500' },
    { label: 'Network Peers', value: 4, icon: 'fa-network-wired', color: 'bg-purple-500' },
    { label: 'Unique Patients', value: Object.keys(chainState.worldState).length, icon: 'fa-user-injured', color: 'bg-emerald-500' },
    { label: 'Smart Contracts', value: '2 (EHR-V1)', icon: 'fa-file-signature', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {currentUser.name}</h1>
        <p className="text-slate-500">Secure Health Record Management Console</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <i className={`fas ${stat.icon} text-xl`}></i>
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800">Global Health Insight Trends</h3>
            <select className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Recent Blockchain Events</h3>
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {chainState.chain.slice(-4).reverse().map((block, i) => (
              <div key={block.blockNumber} className="flex space-x-4 relative">
                {i !== 3 && <div className="absolute left-3 top-8 bottom-[-1.5rem] w-0.5 bg-slate-100"></div>}
                <div className="w-6 h-6 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Block #{block.blockNumber} Committed</p>
                  <p className="text-xs text-slate-500 mt-1">TX: {block.transactions[0].txId.substring(0, 10)}...</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{new Date(block.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
            View All Ledger Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
