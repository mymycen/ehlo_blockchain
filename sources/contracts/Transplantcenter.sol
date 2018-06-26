pragma solidity ^0.4.22;

import "../contracts/Colloquium.sol";
import "../contracts/WaitingList.sol";

contract Transplantcenter{

    struct Recipient {
        address adr;
        string bloodtype;
        uint hla;
        bool accMM;
        uint signupDate; /*block.timestamp - seconds since unix epoch */
        bool highPriority;
        uint age;
        uint region;
        uint country; 

      //  bool set; // This used to differentiate between unset and zero strct values   
    }
    
    // describes a TC member
    struct tcmember {
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
    
    mapping (address => Recipient) public recipientsMap; 
    mapping (address => tcmember) public tcmemberlist;
   
    //event createPatient (address _patientAddress, uint _patientId,string _patientBloodtype,uint _patientAge,uint _patientRegion,bytes32 _patientStatus);
    //event updatePatient (address _patientAddress, uint _patientId,bytes32 _patientStatus);
    //event removePatient (address _patientAddress);

  // function createPatients(address _patientAddress, uint _patientId,string _patientBloodtype,uint _patientAge,uint _patientRegion,bytes32 _patientStatus) public {
  //    Patient storage patient = Patients [_patientAddress];
      //check that the patient does not already exist
      //  require(!patient.set);
      //store the patient
      // Patients[_patientAddress] = Patient({
      //id: _patientId,
      //bloodtype: _patientBloodtype,
      // age:_patientAge,
      //region:_patientRegion,
      //status: _patientStatus,
      //set: true 
      // });
        
   //emit createPatient ( _patientAddress, _patientId, _patientBloodtype,_patientAge, _patientRegion, _patientStatus);

  // }

    //Call Waitinglist add recipient function
    function addRecipient (address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
        WaitingList r = WaitingList (adr);
        r.addRecipient(adr,bt,hla,accMM,signup,hp,age,region,country);
        return r.getRecipientsList();
    }
   // function addRecipient (address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
   //     Recipient memory newRecipient = Recipient(adr, bt, hla, accMM, signup, hp, age, region, country);
   //     recipientsMap[adr] = newRecipient;
   //     recipientsList.push(newRecipient);
   //     return adr;
   // }


    function updateRecipient(address adr, bytes32 _patientStatusForModify) public returns (address) {

        session.updatePatients(adr, _patientStatusForModify);
        Recipient.status = _patientStatusForModify;
    //emit updatePatient ( _patientAddress, _patientId, _patientStatusForModify); 
    
    }
    
   //Call Waitinglist remove recipient function
    function removeRecipient (address a) public returns (address){
       WaitingList b = WaitingList(a);
       b.removeRecipient();
       return b;
   }
    //function removeRecipient (address a) public returns (address) {
    //    for(uint i = 0; i < recipientsList.length; i++) {
    //        if(recipientsList[i].adr == a) { break;}
    //    }
    //    recipientsList[i] = recipientsList[recipientsList.length - 1];
    //    delete recipientsList[recipientsList.length - 1];
    //    recipientsList.length--;
    //    delete recipientsMap[a];

    //    return a;
   // }

  //  function removePatients(address _patientAddress) public {
  //      require(Patient[_patientAddress] !=0); 
  //      for (uint i = Patient[_patientAddress]; i<patients.length-1; i++){
  //          patients[i] = patients[i+1];
  //      }
  //      delete patients[patients.length-1];
  //      patients.length--; 
  //      emit removePatient (_patientAddress); 
  //  }  
        
}

