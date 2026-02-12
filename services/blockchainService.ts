
import { Block, Transaction, HealthRecord, BlockchainState, User } from '../types';

class BlockchainService {
  private state: BlockchainState;

  constructor() {
    this.state = this.initializeGenesis();
  }

  private initializeGenesis(): BlockchainState {
    const genesisRecord: HealthRecord = {
      id: '0',
      patientId: 'SYSTEM',
      doctorId: 'SYSTEM',
      timestamp: Date.now(),
      type: 'DIAGNOSIS',
      data: 'Genesis Block - Network Initialization',
      hash: '0'
    };

    const genesisTx: Transaction = {
      txId: 'tx_0',
      creator: 'NetworkAdmin',
      timestamp: Date.now(),
      payload: genesisRecord,
      signature: 'SIG_GENESIS'
    };

    const genesisBlock: Block = {
      blockNumber: 0,
      previousHash: '0',
      currentHash: this.calculateHash('0' + JSON.stringify(genesisTx)),
      transactions: [genesisTx],
      timestamp: Date.now()
    };

    return {
      chain: [genesisBlock],
      pendingTransactions: [],
      worldState: {}
    };
  }

  private calculateHash(data: string): string {
    // Simple mock hash for demonstration
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  public async submitTransaction(record: HealthRecord, user: User): Promise<Transaction> {
    const txId = `tx_${Math.random().toString(36).substr(2, 9)}`;
    const tx: Transaction = {
      txId,
      creator: `${user.organization}:${user.name}`,
      timestamp: Date.now(),
      payload: record,
      signature: `SIG_${txId}`
    };

    this.state.pendingTransactions.push(tx);
    
    // In Fabric, endorsement/committing happens. We simulate a block every 1 transaction for immediate feedback.
    this.commitBlock();
    
    return tx;
  }

  private commitBlock() {
    if (this.state.pendingTransactions.length === 0) return;

    const lastBlock = this.state.chain[this.state.chain.length - 1];
    const newBlock: Block = {
      blockNumber: lastBlock.blockNumber + 1,
      previousHash: lastBlock.currentHash,
      transactions: [...this.state.pendingTransactions],
      timestamp: Date.now(),
      currentHash: ''
    };

    newBlock.currentHash = this.calculateHash(newBlock.previousHash + JSON.stringify(newBlock.transactions));
    
    // Update World State
    newBlock.transactions.forEach(tx => {
      const pId = tx.payload.patientId;
      if (!this.state.worldState[pId]) {
        this.state.worldState[pId] = [];
      }
      this.state.worldState[pId].push(tx.payload);
    });

    this.state.chain.push(newBlock);
    this.state.pendingTransactions = [];
  }

  public getState(): BlockchainState {
    return { ...this.state };
  }

  public getPatientRecords(patientId: string): HealthRecord[] {
    return this.state.worldState[patientId] || [];
  }
}

export const blockchainService = new BlockchainService();
