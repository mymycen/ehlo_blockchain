pragma solidity ^0.4.17;
import "./WaitingListInterface.sol";

contract WaitingList is isWaitingList{

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

    Recipient[] internal recipientsList;
    Organ[] internal organList;

    function addRecipient (address adr, string bt, uint hla, bool accMM, uint signup, bool hp, uint age, uint region, uint country) public returns (address) {
        Recipient memory newRecipient = Recipient(adr, bt, hla, accMM, signup, hp, age, region, country);
        recipientsMap[adr] = newRecipient;
        recipientsList.push(newRecipient);
        return adr;
    }

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

    function makeList (address organAddr) internal returns (address) {

        Organ memory organ = organMap[organAddr];
        
        listItem[] memory list = new listItem[](recipientsList.length);
        listItem[10] memory _ftAM;
        listItem[10] memory _ftMM;

        for(uint i = 0; i < recipientsList.length; i++) {
            uint score = calculate(organ, recipientsList[i], _ftAM, _ftMM);   
            if(score > 0) {
                list[i] = listItem(recipientsList[i].adr, score);
            }        
        }

        /* Return one recipient */
        score = 0;
        uint index = 0;
        for( i = 0; i < list.length; i++) {
            if(list[i].score > score) {
                score = list[i].score;
                index = i;
            }
        }

        return list[index].addr;
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
    

}



