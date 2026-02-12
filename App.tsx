
import React, { useState, useEffect } from 'react';
import { User, UserRole, ViewType, BlockchainState } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PatientRecords from './components/PatientRecords';
import BlockchainVisualizer from './components/BlockchainVisualizer';
import IdentityManagement from './components/IdentityManagement';
import { blockchainService } from './services/blockchainService';

const INITIAL_DOCTOR: User = {
  id: 'DOC_MITCHELL',
  name: 'Dr. Sarah Mitchell',
  role: UserRole.DOCTOR,
  organization: 'HospitalOrg1.MSP',
  publicKey: 'cert_771c765d897'
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_DOCTOR);
  const [chainState, setChainState] = useState<BlockchainState>(blockchainService.getState());

  const refreshState = () => {
    setChainState(blockchainService.getState());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return <Dashboard chainState={chainState} currentUser={currentUser} />;
      case 'RECORDS':
        return <PatientRecords refreshState={refreshState} currentUser={currentUser} />;
      case 'EXPLORER':
        return <BlockchainVisualizer chain={chainState.chain} />;
      case 'IDENTITY':
        return <IdentityManagement currentUser={currentUser} setCurrentUser={setCurrentUser} />;
      default:
        return <Dashboard chainState={chainState} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} role={currentUser.role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header currentUser={currentUser} chainLength={chainState.chain.length} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
