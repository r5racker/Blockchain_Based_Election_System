import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Election } from '../election';
import { ElectionService } from '../elections/election.service';
import { Web3Service } from './web3.service';

declare let require: any;
const electionArtifacts = require('../../../../build/contracts/ElectionContract.json');

@Injectable({
  providedIn: 'root',
})
export class SmartContractService {
  electionContract: any;
  election: Observable<Election>;
  accountAddress: string;
  serviceStatus: string = '';

  constructor(
    private web3Service: Web3Service,
    private electionService: ElectionService
  ) {
    console.log('In smart-contract service constructor: Web3Service is=');
    console.log(this.web3Service);
    console.log('In smart-contract service constructor: ElectionService is=');
    console.log(this.electionService);

    console.log('In smart-contract service constructor: electionArtifacts=');
    console.log(electionArtifacts);
    
    this.web3Service.convertArtifactsToContract(electionArtifacts);
    //console.log(this.web3Service.electionContract);

    // var absCon = this.web3Service.convertArtifactsToContract(electionArtifacts);
    // console.log("typeof abs =");
    // console.log(absCon);
    // this.electionContract = absCon;
    // console.log('After converting aftifacts: electionContract is =');
    // console.log(this.electionContract);

    // this.web3Service.convertArtifactsToContract(electionArtifacts).then(contact => {
    //   this.electionContract = contact; 
    //   console.log('After converting aftifacts: electionContract is =');
    //   console.log(this.electionContract);
    // });

    this.getAccountAddress();
  }

  getAccountAddress() {
    console.log(this.web3Service.getAccountAddress());
    return this.web3Service.getAccountAddress();
  }

  // Function to initialize and migrate smart contract to the blockchain.
  // We have assumed that smart-contract will be migrated manually using truffle by the admin.
  // async migrateElectionContract(
  //   electionId: string,
  //   mnemonic: string,
  //   port: string,
  //   host: string
  // ) {
  //   try {
  //     // election service election_id and whole Election without above arguments
  //     // make candidates stand for election
  //     //await this.addCandidatesForElection();
  //     // make voters eligible
  //     //await this.makeVotersEligibleForElection();

  //     // Making use of one function only.
  //     if (!this.electionContract) {
  //       this.setServiceStatus(
  //         'in migrateElectionContract() : Election Contract is not loaded.' +
  //         this.electionContract
  //       );
  //       console.log(this.serviceStatus);
  //       return;
  //     }

  //     this.setServiceStatus(
  //       'Trying to initiaze election on smart contract. WAIT for some time'
  //     );
  //     console.log(this.serviceStatus);

  //     try {
  //       const candIds = ['c11', 'c12', 'c13'];
  //       const candNames = ['ca11', 'ca12', 'ca13'];
  //       const voterAddresses = ['', '', ''];
  //       await this.getAccountAddress();
  //       this.electionContract.deployed().then((deployed) => {
  //         deployed
  //           .electionInitialized({}, { fromBlock: 0, toBlock: 'latest' })
  //           .watch(function (err, event) {
  //             console.log('Event Triggered: ' + event);
  //           });
  //         deployed.initializeElection(candIds, candNames, voterAddresses, {
  //           from: this.accountAddress,
  //         });
  //       });
  //       // const deployedElectionContract = this.electionContract.deployed();
  //       // const transaction = deployedElectionContract.initializeElection(
  //       //   candIds,
  //       //   candNames,
  //       //   voterAddresses,
  //       //   { from: this.accountAddress }
  //       // );
  //     } catch (err) {
  //       this.setServiceStatus('ERROR in migrateElectionContract() : ' + err);
  //       console.log(this.serviceStatus);
  //     }
  //     // service api call to change state and description of election => uninitiazed to beforestart (string)
  //     // return string  ("Success") or throwError
  //     this.setServiceStatus('Sccess in migrateElectionContract');
  //     console.log(this.serviceStatus);
  //     return 'Success';
  //   } catch (err) {
  //     console.log('ERROR in migrateElectionContract : error: ' + err);
  //   }
  // }

  async migrateElectionContract(
    electionId: string,
    mnemonic: string,
    port: string,
    host: string
  ) {
    try {
      // election service election_id and whole Election without above arguments
      const candIds = ['c11', 'c12', 'c13'];
      const candNames = ['ca11', 'ca12', 'ca13'];
      const voterAddresses = ['0x4273b4fAf7Af65BcF96C76bEcD79324577AEb44A', '0x5ebd59cBddE5d2ea6F8A6dB93BaCA5876a617FF0', '0xF4C6A71405374c933c8a77EFd156CAcd80155eDc'];
      const privateKey = "1d4c98e4fb04890e0c9d63a75ec3fc7b526893e55334c50d0d9ebc12dddae566";
      this.web3Service.migrateElectionContract(candIds, candNames, voterAddresses, privateKey);
      // service api call to change state and description of election => uninitiazed to beforestart (string)
      // return string  ("Success") or throwError
      this.setServiceStatus('Sccess in migrateElectionContract');
      console.log(this.serviceStatus);
      return 'Success';
    } catch (err) {
      console.log('ERROR in migrateElectionContract : error: ' + err);
      return throwError(err);
    }
  }

  // Function to add candidate for the election
  private async addCandidatesForElection() {
    if (!this.electionContract) {
      this.setServiceStatus(
        'in addCandidatesForElection() : Election Contract is not loaded.' +
        this.electionContract
      );
      console.log(this.serviceStatus);
      return;
    }

    this.setServiceStatus(
      'Trying to add candidates on smart contract. WAIT for some time'
    );
    console.log(this.serviceStatus);

    try {
      const candIds = ['c11', 'c12', 'c13'];
      const candNames = ['ca11', 'ca12', 'ca13'];
      await this.getAccountAddress();
      const deployedElectionContract = this.electionContract.deployed();
      const transaction = deployedElectionContract.addCandidateForElection(
        candIds,
        candNames,
        { from: this.accountAddress }
      );
    } catch (err) {
      this.setServiceStatus('ERROR in addCandidatesForElection() : ' + err);
      console.log(this.serviceStatus);
    }
  }

  // Function to make voters eligible for the election
  private async makeVotersEligibleForElection() {
    if (!this.electionContract) {
      this.setServiceStatus(
        'in makeVotersEligibleForElection() : Election Contract is not loaded.' +
        this.electionContract
      );
      console.log(this.serviceStatus);
      return;
    }

    this.setServiceStatus(
      'Trying to make voters eligible on smart contract. WAIT for some time'
    );
    console.log(this.serviceStatus);

    try {
      const voterAddresses = ['', '', ''];
      await this.getAccountAddress();
      const deployedElectionContract = this.electionContract.deployed();
      var transaction;
      voterAddresses.forEach(function (item) {
        transaction = deployedElectionContract.addCandidateForElection(item, {
          from: this.accountAddress,
        });
      });
    } catch (err) {
      this.setServiceStatus('ERROR in addCandidatesForElection() : ' + err);
      console.log(this.serviceStatus);
    }
  }

  // To initialize the voting process.
  async initializeVotingProcess(electionId: string) {
    // service api call to change state of election => beforestart to started (string)
    // return string  ("Success") or throwError
    try{
      const privateKey = "1d4c98e4fb04890e0c9d63a75ec3fc7b526893e55334c50d0d9ebc12dddae566";
      this.web3Service.initializeVotingProcess(privateKey);
      this.setServiceStatus('Sccess in initializeVotingProcess');
      console.log(this.serviceStatus);
      return 'Success';
    }catch (err) {
      console.log('ERROR in initializeVotingProcess : error: ' + err);
      return throwError(err);
    }
  }

  // To cast vote
  async castVote(electionId: string, candidateId: string) {
    // return string ("Success") or throwError
  }

  // To finalize the voting process
  async finalizeVotingProcess(electionId: string) {
    // service api call to change state of election => started to ended (string)
    // return string  ("Success") or throwError
  }

  async getElectionsResults(electionId: string) {
    // returns Candidate[]
  }

  async getWinningCandidatesDetails(electionId: string) {
    // returns Candidate[]
  }

  private setServiceStatus(message: string) {
    this.serviceStatus = message;
  }
}