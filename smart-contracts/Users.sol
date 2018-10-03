pragma solidity ^0.4.25;


contract mortal {
    /* Define variable owner of the type address */
    address owner;

    /* This function is executed at initialization and sets the owner of the contract */
     constructor() public {owner = msg.sender;}

    /* Function to recover the funds on the contract */
    function kill() public {if (msg.sender == owner) selfdestruct(owner);}
}


contract Users {
    constructor() public{

    }

    struct Info
    {
    string SwarmHash;
    }

    mapping (address => Info) public UsersInfo;

    function setHash(string hash) public{
        UsersInfo[msg.sender].SwarmHash = hash;
    }

     function getHash(address User) public constant returns (string){
        return UsersInfo[User].SwarmHash;
    }
}
