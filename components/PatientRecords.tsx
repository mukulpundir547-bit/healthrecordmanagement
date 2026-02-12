
import React, { useState, useEffect } from 'react';
import { HealthRecord, User, UserRole } from '../types';
import { blockchainService } from '../services/blockchainService';
import { analyzeHealthRecords } from '../services/geminiService';

interface PatientRecordsProps {
  refreshState: () => void;
  currentUser: User;
}

const PatientRecords: React.FC<PatientRecordsProps> = ({ refreshState, currentUser }) => {
  const isPatient = currentUser.role === UserRole.PATIENT;
  const [selectedPatientId, setSelectedPatientId] = useState(isPatient ? currentUser.id : 'PATIENT_001');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const [newRecord, setNewRecord] = useState({
    patientId: '',
    type: 'DIAGNOSIS' as HealthRecord['type'],
    data: '',
  });

  // Effect to sync selected patient when user switches to Patient role
  useEffect(() => {
    if (isPatient) setSelectedPatientId(currentUser.id);
  }, [currentUser.id, isPatient]);

  const records = blockchainService.getPatientRecords(selectedPatientId);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPatient = isPatient ? currentUser.id : (newRecord.patientId || selectedPatientId);
    
    const record: HealthRecord = {
      id: `REC_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      patientId: targetPatient,
      doctorId: currentUser.id,
      timestamp: Date.now(),
      type: newRecord.type,
      data: newRecord.data,
      hash: 'H_' + Math.random().toString(16).substr(2, 8)
    };

    await blockchainService.submitTransaction(record, currentUser);
    setNewRecord({ patientId: '', type: 'DIAGNOSIS', data: '' });
    setIsAdding(false);
    refreshState();
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeHealthRecords(records, selectedPatientId);
    setAnalysisResult(result || "No analysis available.");
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isPatient ? 'My Health Ledger' : 'Clinical Record Management'}
          </h1>
          <p className="text-slate-500">
            {isPatient ? 'Securely viewing your immutable health history' : 'Verify and manage patient clinical data'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {!isPatient && (
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text"
                placeholder="Search Patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedPatientId(searchQuery)}
                className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
          )}
          
          <button 
            onClick={runAiAnalysis}
            disabled={isAnalyzing || records.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center transition-all shadow-lg shadow-indigo-100 font-bold"
          >
            {isAnalyzing ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
            Analyze
          </button>

          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center transition-all shadow-lg shadow-blue-100 font-bold"
          >
            <i className="fas fa-plus mr-2"></i> New Entry
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <i className="fas fa-user-circle text-2xl"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Ledger Subject</p>
            <p className="text-lg font-bold text-slate-800">{selectedPatientId}</p>
          </div>
        </div>
        <div className="px-4 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
          <i className="fas fa-shield-alt mr-2"></i> CHAIN VERIFIED
        </div>
      </div>

      {analysisResult && (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl p-8 relative shadow-sm">
          <button onClick={() => setAnalysisResult(null)} className="absolute top-6 right-6 text-indigo-300 hover:text-indigo-600 transition-colors">
            <i className="fas fa-times-circle text-xl"></i>
          </button>
          <div className="flex items-start space-x-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <i className="fas fa-brain text-2xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">Gemini AI Clinical Summary</h3>
              <div className="prose prose-sm prose-indigo text-indigo-800 whitespace-pre-line leading-relaxed">
                {analysisResult}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction / Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Clinical Content</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Endorser</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                    <div className="mb-4 text-5xl opacity-10"><i className="fas fa-file-medical"></i></div>
                    <p className="font-medium">No medical transactions recorded for this identity.</p>
                  </td>
                </tr>
              ) : (
                records.slice().reverse().map((record) => (
                  <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-900">{new Date(record.timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">{record.id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        record.type === 'DIAGNOSIS' ? 'bg-blue-50 text-blue-600' :
                        record.type === 'PRESCRIPTION' ? 'bg-purple-50 text-purple-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-600 line-clamp-2 max-w-md">{record.data}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 mr-2">
                          {record.doctorId.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {record.doctorId === currentUser.id ? 'Self / Current' : record.doctorId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-[10px] text-green-500 font-bold bg-green-50 px-2 py-1 rounded-md w-fit border border-green-100">
                        <i className="fas fa-check-circle mr-1.5"></i>
                        COMMITTED
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-scaleIn">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Record Transaction</h2>
                  <p className="text-slate-500 text-sm">Submit a clinical proposal to the world state.</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              
              <form onSubmit={handleAddRecord} className="space-y-6">
                {!isPatient && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Patient ID</label>
                    <input 
                      required
                      type="text"
                      value={newRecord.patientId || selectedPatientId}
                      onChange={e => setNewRecord({...newRecord, patientId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="PATIENT_XYZ"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Record Category</label>
                    <select 
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({...newRecord, type: e.target.value as HealthRecord['type']})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none appearance-none"
                    >
                      <option value="DIAGNOSIS">Diagnosis</option>
                      <option value="PRESCRIPTION">Prescription</option>
                      <option value="LAB_RESULT">Lab Result</option>
                      <option value="VITAL_SIGNS">Vital Signs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Clinical Observations</label>
                  <textarea 
                    required
                    value={newRecord.data}
                    onChange={(e) => setNewRecord({...newRecord, data: e.target.value})}
                    placeholder="Enter detailed clinical notes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-blue-100 h-40 resize-none transition-all"
                  ></textarea>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl flex items-center space-x-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                    <i className="fas fa-fingerprint"></i>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    This transaction will be signed with <span className="text-slate-900 font-bold">{currentUser.publicKey.substring(0, 12)}...</span> and endorsed by <span className="text-slate-900 font-bold">{currentUser.organization}</span> before ledger commit.
                  </p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl transition-all">
                    Endorse & Sign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
