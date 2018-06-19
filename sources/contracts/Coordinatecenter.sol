pragma solidity ^0.4.22;

import "../contracts/Colloquium.sol";

contract Coordinatecenter{

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    struct Organ {
        address adr;
        string bloodtype;
        uint age;
        uint region;
        uint country;

        bool set; // This used to differentiate between unset and zero strct values   
    }
    
    // describes a CC member
    struct ccmember {
        uint id;
        bytes32 name;
        uint region;
        // "bool doesExist" is to check if this Struct exists
        // This is so we can keep track of the tcmember
        bool doesExist; 
    }
    using Colloquium for Colloquium.Session;
    Colloquium.Session session;

    constructor () public {
    session.init_session(msg.sender);
	}
    
    mapping (address => Organ) public organMap;
   
    event createOrgan (address _organAdr, string _organBloodtype, uint _organAge,uint _organRegion, uint _organCountry);
    event removeOrgan (address _organAdr);

   function createOrgan(address _organAdr, string _organBloodtype, uint _organAge,uint _organRegion, uint _organCountry) public {
        Organ storage organMap = Organ [_organAdr];
        //check that the organ exist or not
        require(!Organ.set);
        //store the organ
        Organ[_organAdr] = Organ({
        bloodtype: _organBloodtype,
        age:_organAge,
        region:_organRegion,
        country: _organCountry,
        set: true 
        });
        
   emit createOrgan ( _organAdr, _organBloodtype,_organAge, _organRegion, _organCountry);

   }
    

    function removeOrgan(address targetOrgan) onlyOwner public {
        require(OrganAdr[targetOrgan] !=0); 
        for (uint i = Patient[_patientAddress]; i<patients.length-1; i++){
            patients[i] = patients[i+1];
        }
        delete patients[patients.length-1];
        patients.length--; 
        emit removePatient (_patientAddress); 
    }  

    function removeOrgan (address targetOrgan) public returns (address) {
            require(OrganAdr[targetOrgan] !=0); 
        for(uint i = 0; i < organList.length; i++) {
            if(organList[i].adr == targetOrgan) { break;}
        }
        organList[i] = organList[organList.length - 1];
        delete organList[organList.length - 1];
        organList.length--;
        delete organMap[targetOrgan];

        return targetOrgan;
    }
        emit removeOrgan ( _organAdr);
}