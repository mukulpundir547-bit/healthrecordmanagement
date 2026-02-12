
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface IdentityManagementProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const IdentityManagement: React.FC<IdentityManagementProps> = ({ currentUser, setCurrentUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [regData, setRegData] = useState({ name: '', org: 'HospitalOrg1.MSP', role: UserRole.PATIENT });

  const roles = [
    { 
      role: UserRole.DOCTOR, 
      icon: 'fa-user-md', 
      desc: 'Clinical staff with endorsement permissions.',
      defaultUser: { id: 'DOC_MITCHELL', name: 'Dr. Sarah Mitchell', org: 'HospitalOrg1.MSP' }
    },
    { 
      role: UserRole.PATIENT, 
      icon: 'fa-user', 
      desc: 'Owner of the health records with access control.',
      defaultUser: { id: 'PATIENT_001', name: 'John Doe', org: 'PatientsOrg.MSP' }
    },
    { 
      role: UserRole.ADMIN, 
      icon: 'fa-user-shield', 
      desc: 'Network administrator for channel management.',
      defaultUser: { id: 'ADMIN_ROOT', name: 'System Admin', org: 'OrdererOrg.MSP' }
    },
  ];

  const handleSwitch = (config: any) => {
    setCurrentUser({
      id: config.defaultUser.id,
      name: config.defaultUser.name,
      role: config.role,
      organization: config.defaultUser.org,
      publicKey: `cert_${Math.random().toString(36).substr(2, 9)}`
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      id: `USR_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: regData.name,
      role: regData.role,
      organization: regData.org,
      publicKey: `cert_new_${Date.now()}`
    });
    setIsRegistering(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Identity & Membership (MSP)</h1>
          <p className="text-slate-500">Manage cryptographic identities on the Hyperledger Fabric network</p>
        </div>
        <button 
          onClick={() => setIsRegistering(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center shadow-lg shadow-blue-100"
        >
          <i className="fas fa-plus-circle mr-2"></i> Register New Identity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Active Certificate Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <i className="fas fa-shield-alt text-6xl text-slate-50 opacity-10"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <i className="fas fa-id-card-alt mr-3 text-blue-500"></i> Active Digital Identity
          </h3>
          
          <div className="flex items-center space-x-6 mb-8">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg ${
              currentUser.role === UserRole.DOCTOR ? 'bg-blue-600' : 
              currentUser.role === UserRole.PATIENT ? 'bg-emerald-600' : 'bg-slate-900'
            }`}>
              <i className={`fas ${roles.find(r => r.role === currentUser.role)?.icon}`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-slate-500 font-medium">{currentUser.organization}</p>
              <div className="flex items-center mt-2 text-[10px] font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full w-fit tracking-wider">
                STATUS: ENROLLED & ACTIVE
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-xl font-mono text-[10px] text-emerald-400 break-all leading-relaxed border border-slate-800">
              <span className="text-slate-500"># Fabric X.509 Certificate</span><br/>
              Subject: CN={currentUser.name}, OU={currentUser.role}, O={currentUser.organization}<br/>
              PubKey: {currentUser.publicKey}<br/>
              Issuer: Fabric-CA-Chain
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Role Switch (Development Mode)</h3>
          <div className="grid gap-4">
            {roles.map((item) => (
              <button
                key={item.role}
                onClick={() => handleSwitch(item)}
                className={`flex items-start p-4 rounded-2xl border-2 transition-all text-left group ${
                  currentUser.role === item.role 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                  currentUser.role === item.role ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className={`fas ${item.icon} text-lg`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{item.role}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
                {currentUser.role === item.role && (
                  <div className="ml-2 animate-pulse">
                    <i className="fas fa-check-circle text-blue-500"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isRegistering && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scaleIn">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Register New Entity</h2>
            <p className="text-slate-500 text-sm mb-6">Create a new identity and generate X.509 certificates.</p>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                <input 
                  required
                  type="text"
                  value={regData.name}
                  onChange={e => setRegData({...regData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Alice Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Organization (MSP)</label>
                <select 
                  value={regData.org}
                  onChange={e => setRegData({...regData, org: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                >
                  <option>HospitalOrg1.MSP</option>
                  <option>HospitalOrg2.MSP</option>
                  <option>PatientsOrg.MSP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role Type</label>
                <div className="flex space-x-2">
                  {[UserRole.DOCTOR, UserRole.PATIENT].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegData({...regData, role: r})}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                        regData.role === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="flex-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Enroll Identity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityManagement;
