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
    mapping(uint => Proposal) public proposals; //proposalId => Proposal
    uint public totalProposalCount = 0;
    Matter[] public matters;

    event VoterRegistered(address voterAddress);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId, uint matterId);

    constructor() {
        admin = msg.sender;
    }

    function registerVoter(address _voterAddress) public {
        require(msg.sender == admin, "Only the admin can register a voter");
        require(!voters[_voterAddress].isRegistered, "The voter is already registered");

        voters[_voterAddress].isRegistered = true;

        emit VoterRegistered(_voterAddress);
    }

    function registerProposal(uint _matterId, string memory _description) public {
        require(voters[msg.sender].isRegistered, "Only registered voters can register a proposal");

        proposals[totalProposalCount] = Proposal(totalProposalCount, _description, 0, _matterId);
        matters[_matterId].proposalsCount++;
        totalProposalCount++;

        emit ProposalRegistered(matters[_matterId].proposalsCount);
    }

    function registerMatter(string memory _description) public {
        require(voters[msg.sender].isRegistered, "Only registered voters can register a matter");

        matters.push(Matter(matters.length, _description, 0));
    }

    function vote(uint _proposalId) public {
        require(voters[msg.sender].isRegistered, "Only registered voters can vote");

        uint mtrID = proposals[_proposalId].matterId;
        require(!voters[msg.sender].hasVoted[mtrID], "The voter has already voted for this proposal");

        voters[msg.sender].hasVoted[mtrID] = true;

        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId, mtrID);
    }

    function getWinningProposal(uint _matterId) public view returns (uint) {
        uint winningProposalId = 0;
        uint winningVoteCount = 0;

        for (uint i = 0; i < matters[_matterId].proposalsCount; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningProposalId = i;
                winningVoteCount = proposals[i].voteCount;
            }
        }

        return winningProposalId;
    }

    function getMattersCount() public view returns (uint) {
        return matters.length;
    }

    function getProposalById(uint _matterId, uint _proposalId) public view returns (Proposal memory) {
        return proposals[_proposalId];
    }

    function getMatterById(uint _matterId) public view returns (Matter memory) {
        return matters[_matterId];
    }

    function getProposalCount() public view returns (uint) {
        return totalProposalCount;
    }

    function getProposalVoteCount(uint _proposalId) public view returns (uint) {
        return proposals[_proposalId].voteCount;
    }



}
