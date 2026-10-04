import {randomUUID} from 'crypto';

class MatchManager{
    constructor(){
        this.matches = new Map();  //each active match
        this.userMatches = new Map(); //maps each userid to their active match
    }

    createMatch(userId1,userId2){
        const id1= userId1.toString();
        const id2= userId2.toString();

        if(this.userMatches.has(id1) || this.userMatches.has(id2)){
            return null; // One of the users is already in a match
        }

        const matchId = randomUUID();

        const match={
            matchId,
            participants:[id1,id2],
            status:'active',
            createdAt: new Date()
        }

        this.matches.set(matchId,match);
        this.userMatches.set(id1,matchId);
        this.userMatches.set(id2,matchId);

        return match;
    }

    getMatchByUserId(userId){
        const id=userId.toString();
        const matchId= this.userMatches.get(id);

        if(!matchId) return null;

        return this.matches.get(matchId) || null;
    }

    getMatchById(matchId){
        return this.matches.get(matchId) || null; 
    }

    isMatchParticipant(matchId,userId){
        const match = this.matches.get(matchId);
        if(!match) return false;

        return match.participants.includes(userId.toString());
    }

    endMatch(matchId){
        const match = this.matches.get(matchId);

        if(!match) return null;

        this.matches.delete(matchId);

        for(const userId of match.participants){
            this.userMatches.delete(userId);
        }

        return match;
    }

    isUserMatched(userId){
        return this.userMatches.has(userId.toString());
    }
}

const matchManager = new MatchManager();

export default matchManager;
