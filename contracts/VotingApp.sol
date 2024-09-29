pragma solidity ^0.8.27;

contract VotingApp {

    struct Voter {
        bool isRegistered;
        mapping (uint => bool) hasVoted; //matterId => hasVoted
    }

    struct Proposal {
        uint id;
        string description;
        uint voteCount;
        uint matterId;
    }

    struct Matter {
        uint id;
        string description;
        uint proposalsCount;
    }

    address public admin;
    mapping(address => Voter) public voters;
    mapping(uint => Proposal[]) public matterProposals; //matterId => Proposal[]
    uint public totalProposalCount = 0;
    Matter[] public matters;

    event VoterRegistered(address voterAddress);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId, uint matterId);

    constructor() {
        admin = msg.sender;
        matters.push(Matter(0, "Initial matter", 0));
        matters.push(Matter(1, "Second matter", 0)); // Add a second matter for testing
    }

    function registerVoter(address _voterAddress) public {
        require(msg.sender == admin, "Only the admin can register a voter");
        require(!voters[_voterAddress].isRegistered, "The voter is already registered");

        voters[_voterAddress].isRegistered = true;

        emit VoterRegistered(_voterAddress);
    }

    function registerMatter(string memory _description) public {
        require(voters[msg.sender].isRegistered || msg.sender == admin, "Only registered voters can register a matter");

        matters.push(Matter(matters.length, _description, 0));
    }

    function registerProposal(uint _matterId, string memory _description) public {
        require(voters[msg.sender].isRegistered || msg.sender == admin, "Only registered voters can register a proposal");
        require(_matterId < matters.length, "Matter does not exist"); // Ensure the matter exists

        Proposal memory newProposal = Proposal(matterProposals[_matterId].length, _description, 0, _matterId);
        matterProposals[_matterId].push(newProposal);
        matters[_matterId].proposalsCount++;
        totalProposalCount++;

        emit ProposalRegistered(newProposal.id);
    }


    function vote(uint _matterId, uint _proposalId) public {
        require(voters[msg.sender].isRegistered, "Only registered voters can vote");
        require(!voters[msg.sender].hasVoted[_matterId], "The voter has already voted on this matter");

        voters[msg.sender].hasVoted[_matterId] = true;

        matterProposals[_matterId][_proposalId].voteCount++;
        totalProposalCount++;

        emit Voted(msg.sender, _proposalId, _matterId);
    }

    function getWinningProposal(uint _matterId) public view returns (uint) {
        uint winningProposalId = 0;
        uint winningVoteCount = 0;

        Proposal[] storage proposalsForMatter = matterProposals[_matterId]; // Use storage instead of memory

        for (uint i = 0; i < proposalsForMatter.length; i++) {
            if (proposalsForMatter[i].voteCount > winningVoteCount) {
                winningProposalId = proposalsForMatter[i].id;
                winningVoteCount = proposalsForMatter[i].voteCount;
            }
        }

        return winningProposalId;
    }



    function getMattersCount() public view returns (uint) {
        return matters.length;
    }

    function getProposalById(uint _matterId, uint _proposalId) public view returns (Proposal memory) {
        return matterProposals[_matterId][_proposalId];
    }

    function getMatterById(uint _matterId) public view returns (Matter memory) {
        return matters[_matterId];
    }

    function getProposalCount() public view returns (uint) {
        return totalProposalCount;
    }

    function getProposalVoteCount(uint _matterId, uint _proposalId) public view returns (uint) {
        return matterProposals[_matterId][_proposalId].voteCount;
    }



}
