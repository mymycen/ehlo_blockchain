pragma solidity ^0.4.22;

import "../contracts/Colloquium.sol";

contract Transplantcenter{

    struct Patient {
        uint id;
        string bloodtype;
        uint age;
        uint region;
        bytes32 status; 

        bool set; // This used to differentiate between unset and zero strct values   
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
    
    mapping (address => Patient) public Patients; 
   
    event createPatient (address _patientAddress, uint _patientId,string _patientBloodtype,uint _patientAge,uint _patientRegion,bytes32 _patientStatus);
    event updatePatient (address _patientAddress, uint _patientId,bytes32 _patientStatus);
    event removePatient (address _patientAddress);

   function createPatients(address _patientAddress, uint _patientId,string _patientBloodtype,uint _patientAge,uint _patientRegion,bytes32 _patientStatus) public {
        Patient storage patient = Patients [_patientAddress];
        //check that the patient does not already exist
        require(!patient.set);
        //store the patient
        Patients[_patientAddress] = Patient({
        id: _patientId,
        bloodtype: _patientBloodtype,
        age:_patientAge,
        region:_patientRegion,
        status: _patientStatus,
        set: true 
        });
        
   emit createPatient ( _patientAddress, _patientId, _patientBloodtype,_patientAge, _patientRegion, _patientStatus);

   }

    function updatePatients(address _patientAddress, uint _patientId,bytes32 _patientStatusForModify) public {
 
        
        session.updatePatients(_patientId, _patientStatusForModify);
        Patient.status = _patientStatusForModify;
        
    emit updatePatient ( _patientAddress, _patientId, _patientStatusForModify); 
    
    }
    

    function removePatients(address _patientAddress) public {
        require(Patient[_patientAddress] !=0); 
        for (uint i = Patient[_patientAddress]; i<patients.length-1; i++){
            patients[i] = patients[i+1];
        }
        delete patients[patients.length-1];
        patients.length--; 
        emit removePatient (_patientAddress); 
    }  
        

    
}