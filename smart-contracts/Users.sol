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
    string Username;
    }

    mapping (address => Info) public UsersInfo;
    mapping (string => address) Usernames;

    function setHash(string hash) public{
        UsersInfo[msg.sender].SwarmHash = hash;
    }

     function getHash(address User) public constant returns (string){
        return UsersInfo[User].SwarmHash;
    }

    function setUsername(string username) public returns (string){
        // todo release old user nickname if he set new one
        username = _toLower(username);
        address usernameOwner = Usernames[username];
        if(usernameOwner != address(0) && usernameOwner != msg.sender){
           return 'already registered';
        } else if(usernameOwner != address(0) && usernameOwner == msg.sender){
            return 'ok';
        } else{
            Usernames[username]=msg.sender;
            UsersInfo[msg.sender].Username = username;
            return 'ok';
        }
    }

    function getUsername(address wallet) public constant returns (string){
       return UsersInfo[wallet].Username;
    }

    function getMyUsername() public constant returns (string){
       return UsersInfo[msg.sender].Username;
    }

    function getAddressByUsername(string username) public constant returns (address){
        username = _toLower(username);
        return Usernames[username];
    }

    function _toLower(string str) internal pure returns (string) {
		bytes memory bStr = bytes(str);
		bytes memory bLower = new bytes(bStr.length);
		for (uint i = 0; i < bStr.length; i++) {
			// Uppercase character...
			if ((bStr[i] >= 65) && (bStr[i] <= 90)) {
				// So we add 32 to make it lowercase
				bLower[i] = bytes1(int(bStr[i]) + 32);
			} else {
				bLower[i] = bStr[i];
			}
		}
		return string(bLower);
	}
}
