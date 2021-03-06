// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/// @title SecurElect Election Smart Contract
contract ElectionContract {
    enum electionStatus {
        initialized,
        readyForVoting,
        votingStarted,
        votingEnded
    }
    electionStatus public currentElectionStatus;

    address public admin;

    // Structure definition of the candidate
    struct Candidate {
        string candId;
        string name; // name of the candidate
        uint256 voteCount; // number of votes candidate has
    }

    // Array of candidates.
    // Array size is dynamic so that we can use the contract for different elcetions
    Candidate[] private candidates;
    // Array of winner candidates
    Candidate[] private winningCandidates;

    // Structure definition of the voter
    struct Voter {
        bool eligible; // if true, then the person is eligible to vote
        bool voted; // if true, then the voter has already voted
    }

    // Mapping of addresses(public keys) and voters.
    // We can access elements of 'Voter' structure by the address of the voter
    mapping(address => Voter) public voters;

    // event to be emitted after successful initialization
    event contractInitialized(address indexed _from);

    // candidates are added for the election
    event candidatesAdded(
        address indexed _from,
        string[] candidateIds,
        string[] candidateNames
    );

    // voters made eligible events
    event votersMadeEligible(address indexed _from, address[] voterAddresses);

    // election initialized successfully
    event electionInitialized(address indexed _from);

    // voted event when vote is casted successfully
    event votedEvent(address indexed _from);

    // Event for initialized voting process
    event votingProcessIntialized(address indexed _from);

    // Event for finalized voting process
    event votingProcessFinalized(address indexed _from);

    // constructor of election contract
    constructor() {
        admin = msg.sender;
        voters[admin].eligible = true; // Admin can also vote in the election

        currentElectionStatus = electionStatus.initialized; // The contract is initialized.

        // Construction Successful.
        emit contractInitialized(msg.sender);
    }

    // candidates names are taken dynamically so that we can use the contract for different elcetions
    function addCandidateForElection(
        string[] memory candidateIds,
        string[] memory candidateNames
    ) private {
        // Message sender must be admin because only admin can add the candidates for election
        require(
            msg.sender == admin,
            "ERROR : Admin is allowed to add candidates for the election."
        );

        require(
            candidateIds.length == candidateNames.length,
            "ERROR : Arguments Invalid : Ids and Names arrays are not of same length"
        );
        // Adding objects of the candidates in the array from the givan names.
        for (uint256 i = 0; i < candidateNames.length; i++) {
            candidates.push(
                Candidate({
                    candId: candidateIds[i],
                    name: candidateNames[i],
                    voteCount: 0
                })
            );
        }
        currentElectionStatus = electionStatus.readyForVoting; // The voting process can be started now.

        // successfully added candidates.
        emit candidatesAdded(msg.sender, candidateIds, candidateNames);
    }

    // Making the voter eligible to vote for the election
    function makeVoterEligible(address[] memory voterAddresses) private {
        // Admin can make voter eligible only before the election is started
        require(
            currentElectionStatus == electionStatus.readyForVoting,
            "ERROR : Cannot make a voter eligible after the election has started."
        );

        // Message sender must be admin because only admin can make a person eligible for voting
        require(
            msg.sender == admin,
            "ERROR : Admin is allowed to make a person eligible to vote."
        );
        // require(
        //     !voters[voterAddress].voted,
        //     "ERROR : This voter has voted in this election."
        // );
        // above condition is not needed to check, hence commented in order to avoid confusion

        for (uint256 x = 0; x < voterAddresses.length; x++) {
            require(
                !voters[voterAddresses[x]].eligible,
                "INFO : This person is already eligible to vote."
            );
            voters[voterAddresses[x]].eligible = true; // Making voter Eligible to vote
        }

        // successfully made voter eligible
        emit votersMadeEligible(msg.sender, voterAddresses);
    }

    // To initialize the voting by adding candidates and making developers eligible
    function initializeElection(
        string[] memory candidateIds,
        string[] memory candidateNames,
        address[] memory voterAddresses
    ) public {
        addCandidateForElection(candidateIds, candidateNames);
        makeVoterEligible(voterAddresses);
        emit electionInitialized(msg.sender);
    }

    // Voting function
    function vote(string memory candidateId) public {
        // Voter can only vote after the elction has started and before ended
        require(
            currentElectionStatus == electionStatus.votingStarted,
            "ERROR : Cannot vote before or after the election"
        );

        Voter storage voteSender = voters[msg.sender];
        require(
            voteSender.eligible,
            "ERROR : Person is not eligible to vote for the election"
        );
        require(
            !voteSender.voted,
            "ERROR : This voter has voted earlier in the election."
        );
        voteSender.voted = true; // Making sure that one voter only votes once.

        for (uint256 j = 0; j < candidates.length; j++) {
            if (
                keccak256(bytes(candidateId)) ==
                keccak256(bytes(candidates[j].candId))
            ) {
                candidates[j].voteCount += 1;
                return;
            }
        }

        emit votedEvent(msg.sender); // Voted successfully event

        require(
            false,
            "ERROR : Invalid candidate Id entered while voting in the election"
        ); // Program reaches here only when invalid ID is entered.
    }

    // returning the candidate details.
    function getCandidateDetails()
        public
        view
        returns (Candidate[] memory candidateDetails)
    {
        // Winner candidate can be get only when the election is ended.
        require(
            currentElectionStatus == electionStatus.votingEnded,
            "ERROR : Cannot get candidate details before the election is ended."
        );

        candidateDetails = candidates;
    }

    // returning the candidate details of the winner.
    function getWinnerCandidateDetails()
        public
        view
        returns (Candidate[] memory winnerCandidates)
    {
        // Winner candidate can be get only when the election is ended.
        require(
            currentElectionStatus == electionStatus.votingEnded,
            "ERROR : Cannot get winner candidate details before the election is ended."
        );

        winnerCandidates = winningCandidates;
    }

    // changing the status of election from 'readyForVoting' to 'votingStarted'
    function initializeVotingProcess() public {
        // Message sender must be admin because only admin can initiate the voting process
        require(
            msg.sender == admin,
            "ERROR : Admin is allowed to initiate the voting process"
        );

        // Election must not be ended.
        require(
            currentElectionStatus != electionStatus.votingEnded,
            "ERROR : The Elcetion can not be started again after it is ended."
        );
        currentElectionStatus = electionStatus.votingStarted;

        emit votingProcessIntialized(msg.sender); // successfully initialized voting process
    }

    // changing the status of election status from 'votingStarted' to 'votingEnded'
    // Comparing the voteCount of canidates and setting the winner candidateId
    function finalizeVotingProcess() public {
        // Message sender must be admin because only admin can finalize the voting process
        require(
            msg.sender == admin,
            "ERROR : Admin is allowed to finalize the voting process"
        );

        require(
            currentElectionStatus == electionStatus.votingStarted,
            "ERROR : Election has not started yet."
        );
        currentElectionStatus = electionStatus.votingEnded;

        uint256 maxVoteCount = 0; // to keep track of maximum votes so far

        // Finding the maximum votes and its candidate index
        for (uint256 k = 0; k < candidates.length; k++) {
            if (candidates[k].voteCount > maxVoteCount) {
                maxVoteCount = candidates[k].voteCount;
            }
        }

        require(
            maxVoteCount != 0,
            "ERROR : No voter has voted yet in the election so far."
        );

        // Loop is used to handle "TIE" condition between multiple candidates.
        // Adding candidate IDs to the winning list.
        for (uint256 l = 0; l < candidates.length; l++) {
            if (candidates[l].voteCount == maxVoteCount) {
                winningCandidates.push(candidates[l]);
            }
        }

        emit votingProcessFinalized(msg.sender); // successfully finalized voting process
    }

    function getVoterByAddress(address publicKey)
        public
        view
        returns (Voter memory retVoter) {
        retVoter = voters[publicKey];
    }
}
