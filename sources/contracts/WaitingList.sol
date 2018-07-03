pragma solidity ^0.4.17;

import "../contracts/CoordinationCenter.sol";
import "../contracts/CoordinationCenterMaster.sol";
import '../contracts/TransplantCenter.sol';
import '../contracts/TransplantCenterMaster.sol';


contract WaitingList {

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
    }

    struct Organ {
        address adr;
        string bloodtype;
        uint age;
        uint region;
        uint country;
    }
    
    struct listItem {
        address addr;
        uint score;
    }

    mapping (address => Recipient) recipientsMap;
    mapping (address => Organ) organMap;

    Recipient[] recipientsList;
    Organ[] organList;
	

    address cc_master_addr;
    address tc_master_addr;

    /**
     * This methods creates a CC and CC master contract as well as the TC and TC master contact. 
     */
    constructor() public {
        // CoordinationCenter
        address cc_addr = new CoordinationCenter();
        CoordinationCenter cc = CoordinationCenter(cc_addr);

        cc_master_addr = new CoordinationCenterMaster();
        CoordinationCenterMaster cc_master = CoordinationCenterMaster(cc_master_addr);

        cc.bind(cc_master_addr);
        cc_master.bind(this);

        cc.register(msg.sender);
        cc_master.register(cc_addr);

        // TransplantCenter
        address tc_addr = new TransplantCenter();
        TransplantCenter tc = TransplantCenter(tc_addr);
        
        tc_master_addr = new TransplantCenterMaster();
        TransplantCenterMaster tc_master = TransplantCenterMaster(tc_master_addr);

        tc.bind(tc_master_addr);
        tc_master.bind(this);

        tc.register(msg.sender);
        tc_master.register(tc_addr);

    }

    function get_cc_master() public view returns (address) {
        return cc_master_addr;
    }

    function get_tc_master() public view returns (address) {
        return tc_master_addr;
    }

    function getRecipientBloodtype(address adr) public returns (string) {
        return recipientsMap[adr].bloodtype;
    }

    function getRecipientHLA(address adr) public returns (uint) {
        return recipientsMap[adr].hla;
    }

    function getRecipientAccMM(address adr) public returns (bool) {
        return recipientsMap[adr].accMM;
    }

    function getRecipientSignupdate(address adr) public returns (uint) {
        return recipientsMap[adr].signupDate;
    }

    function getRecipientPriority(address adr) public returns (bool) {
        return recipientsMap[adr].highPriority;
    }

    function getRecipientAge (address adr) public returns (uint) {
        return recipientsMap[adr].age;
    }

    function getRecipientRegion(address adr) public returns (uint) {
        return recipientsMap[adr].region;
    }

    function getRecipientCountry(address adr) public returns (uint) {
        return recipientsMap[adr].country;
    }

    function addRecipient (address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
        var newRecipient = Recipient(adr, bt, hla, accMM, signup, hp, age, region, country);
        recipientsMap[adr] = newRecipient;
        recipientsList.push(newRecipient);
        return adr;
    }
	
	  function updateRecipient (address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
        var newRecipient = Recipient(adr, bt, hla, accMM, signup, hp, age, region, country);
        recipientsMap[adr] = newRecipient;
		for(uint n = 0; n < recipientsList.length; n++) {
			if(recipientsList[n].adr == newRecipient.adr) {
				recipientsList[n] = newRecipient;
			}
		} 
        return adr;
    }
/*
    function getRecipients() public returns (Recipient[]) {
        return recipientsList;
    }
*/
    function removeRecipient (address a) public returns (address) {
        for(uint i = 0; i < recipientsList.length; i++) {
            if(recipientsList[i].adr == a) { break;}
        }
        recipientsList[i] = recipientsList[recipientsList.length - 1];
        delete recipientsList[recipientsList.length - 1];
        recipientsList.length--;
        delete recipientsMap[a];

        return a;
    }

    function addOrgan(address addr, string bt, uint age, uint region, uint country) public returns (address[20]) {
        Organ memory organ = Organ(addr, bt, age, region, country);
        //organList.push(organMap[addr]);
        
        return makeList(organ);
    }

    function makeList (Organ organ) internal returns (address[20]) {

        //Organ memory organ = organMap[organAddr];
        
        listItem[] memory list = new listItem[](recipientsList.length);
        listItem[10] memory _ftAM;
        listItem[10] memory _ftMM;
        listItem[20] memory finalList;
		address[20] memory finalListAddr;

        uint i = 0;
        uint k = 0;
        listItem memory tmp;

        for(i = 0; i < recipientsList.length; i++) {
            uint score = calculate(organ, recipientsList[i], _ftAM, _ftMM);   
            if(score > 0) {
                list[i] = listItem(recipientsList[i].adr, score);
            }        
        }
				
        /* Puts the 20 listItems with the highest scores in finalList. Afterwards
           finalList is an ordered list of the 20 highest scores with the highest
           score being at index 0 the lowest at index 19. */
        
        for(k = 0; k < list.length; k++) {
            if(list[k].score <= finalList[19].score)  {
                continue;
            } else {
                /* Score of list item is larger than lowest score in the final list. this
                   means the list item needs to be added to the final list.*/
                for(i = 0; i < 20; i++){
                    if(finalList[i].score <= list[k].score) {
                        finalList = insert(finalList, list[k],i);
                        break;
                    }
                }
            }
        }
		
		
        
        /* sort _ftMM */
        for(k = 1; k < 10; k++) {
            for(i = k; k > 0; k--) {
                if(_ftMM[k].score > _ftMM[k-1].score){
                    tmp = _ftMM[k-1];
                    _ftMM[k-1] = _ftMM[k];
                    _ftMM[k] = tmp;
                } else {
                    break;
                }
            }
        }
        
        /* sort _ftAM */
        for(k = 1; k < 10; k++) {
            for(i = k; k > 0; k--) {
                if(_ftAM[k].score > _ftAM[k-1].score){
                    tmp = _ftAM[k-1];
                    _ftAM[k-1] = _ftAM[k];
                    _ftAM[k] = tmp;
                } else {
                    break;
                }
            }
        }
        
        /* Merge finalList with the list of the missmatch high scores. */
        i = 0;
        for(k = 0; k < 10; k++) {
            if(_ftMM[k].score > 0) {
                finalList = insert(finalList, _ftMM[k], i++);
            }
        }
        
        /* Merge finalList with the list of the acceptabl missmatch high scores. */
        i = 0;
        for(k = 0; k < 10; k++) {
            if(_ftAM[k].score > 0) {
                finalList = insert(finalList, _ftAM[k], i++);
            }
        }

        /* Return one recipient 
        score = 0;
        uint index = 0;
        for( i = 0; i < list.length; i++) {
            if(list[i].score > score) {
                score = list[i].score;
                index = i;
            }
        }

        return list[index].addr;
        
        */
        
        for(i=0; i < 20;i++){
            finalListAddr[i] = finalList[i].addr;
        }
		
		return finalListAddr;
        
    }
    
    /*********************************************************************
     * 
     * Inserts a list item at a given position in a merged list. The items
     * in the merged list, whose index is higher than position are shifted.
     * The last item of the merged list is lost.
     * 
     **********************************************************************/
    
    function insert (listItem[20] mlist, listItem item, uint pos) internal returns (listItem[20]) {
        if(pos < 0 || pos >= 20) {
            return mlist;
        }
        for(uint i = 19; i > pos; i--) {
            mlist[i] = mlist[i-1];
        }
        mlist[pos] = item;
        return mlist;
    }

    /****************************************************************
     *
     * Calculates the matching score of one patient for a given Organ
     *
     ****************************************************************/

    function calculate(Organ organ, Recipient res, listItem[10] ftAM, listItem[10] ftMM) private returns (uint) {
        uint score = 0;
        uint counter_ftAM = 0;

        /* Check if recipient is in acceptable missmatch programm */
        if(res.accMM) {
            /* Check if recipient matches bloodtype. If not recipient gets excluded. */
            if(checkBloodtypeAM(organ, res)) {
                /* Patient matches program and bloodtype - gets put on the fasttrack list for 
                   acceptable missmatch patients. */
                ftAM[counter_ftAM++] = listItem(res.adr, addWaitingTime(res));
                return score;
            } else {
                return score;
            }
        } else {
            /* Check if recipient matches bloodtype. If not recipient gets excluded. */
            if(strcmp(organ.bloodtype, res.bloodtype) == false) {
                return score;
            } 
        }

        /* Patient matches bloodtype. Check HLA Missmatch */
        uint HLAMiss = calcHLAMissmatch(organ, res);

        /* If HLAMiss == 400 patient is allocated to 0-Missmatch-Allocation and gets put on 
           the fasttrack list according to waiting time. */
        if(HLAMiss == 400) {

            ftMM[counter_ftAM++] = listItem(res.adr, addWaitingTime(res));
            
            /* Patient added to 0-Missmatch-Allocation list. Score calculation ends.*/
            return 0;
        }

        /* Add score for HLA-Missmatch */
        score += HLAMiss;

        /* Add score for missmatch probability. */
        score += calcMMP(res);

        /* Add score for waiting time on list. */
        score += addWaitingTime(res);

        /* Add regional bonus if patient and organ are close together. */
        if(res.region == organ.region) {
            score += 200;
        } else if (res.country == organ.country) {
            score += 100;
        }

        /* Add 500 points for high priority patients */
        if(res.highPriority == true) {
            score += 500;
        }

        /* Add points for children and growing adults. */
        if(res.age <= 16) {
            score += HLAMiss * 2;
        }
        /* Growing adults get a bonus of 100 points. */
        if(res.age <= 21) {
            score += 100;
        }

        return score;
    }

    /*********************************************************************************
     *
     * Calculates the score for the waiting time of a patient. 33 points for each year 
     * or 0.091 points per day.
     *
     ********************************************************************************/

    function addWaitingTime(Recipient r) private returns (uint) {
        uint  waitingTimeSec = block.timestamp - r.signupDate;
        uint  waitingTimeDays = waitingTimeSec / (60*60*24);
        return (waitingTimeDays * 91 / 1000);
    }


    /***************************************************************************
     *
     * Calculates the Missmatch Probability (MMP) of a patient and returns a score between
     * 0 and 100.
     *
     *************************************************************************************/

    function calcMMP(Recipient r) private returns (uint) {
        /* TO DO! */
        return 0;
    }

    /********************************************************************************
     *
     * Calculates the HLA Missmatch score for a given patient.
     *
     ************************************************************************/

    function calcHLAMissmatch(Organ o, Recipient r) private returns (uint) {
        return 400 * (1 - (r.hla / 6));
    }


    /***********************************************************************
     *
     * Checks if the bloodtype of a patient in the acceptable missmatch program
     * matches a given organ. If it does return true if not false.
     *
     ***************************************************************************/

    function checkBloodtypeAM(Organ o, Recipient r) private returns (bool) {
        if(strcmp(o.bloodtype, '0')) {
            if(strcmp(r.bloodtype, 'A') || strcmp(r.bloodtype, '0') || strcmp(r.bloodtype, 'AB') || strcmp(r.bloodtype, 'B')) {
                return true;
            }
        } else if(strcmp(o.bloodtype, 'A')) {
            if(strcmp(r.bloodtype, 'A') || strcmp(r.bloodtype, 'AB') ) {
                return true;
            }
        } else if(strcmp(o.bloodtype,'B')) {
            if(strcmp(r.bloodtype, 'B') || strcmp(r.bloodtype, 'AB') ) {
                return true;
            }
        } else if(strcmp(o.bloodtype,'AB')) {
            if(strcmp(r.bloodtype, 'AB') ) {
                return true;
            }
        } else {
            return false;
        }
    }
    
    function strcmp(string _a, string _b) private returns (bool)  {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        if(a.length != b.length) return false;
        for(uint i = 0; i < a.length; i++) {
            if(a[i] != b[i]) return false;
        }
        return true;
    }

    function get_recipients_count() public view returns(uint) {
        return recipientsList.length;
    }

    function get_recipient(uint i) public view returns(address) {
        return recipientsList[i].adr;
    }
}




