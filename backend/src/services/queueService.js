import matchMakingQueue from "../singletons/queueSingleton.js";
import matchManager from "../singletons/matchManager.js";

export const joinQueue = async(user) => {

    const userId = user._id.toString();

    if(matchManager.isUserMatched(userId)){
        return {
            matched: false,
            message: "You are already in a match."
        };
    }

    if(matchMakingQueue.isUserWaiting(userId)){
        return {
            matched: false,
            message: "User is already in the queue."
        };
    }
    
    const existingMatch = matchMakingQueue.findMatch(user);

    if(existingMatch){
        matchMakingQueue.removeUser(existingMatch._id);
        return {
            matched: true,
            user: existingMatch
        };
    }

    matchMakingQueue.addUser(user);

    return {
        matched: false,
        message: "User added to the queue. Waiting for a match."
    };
}

export const leaveQueue = async(userId) => {
    matchMakingQueue.removeUser(userId);
    return {
        message: "User removed from the queue."
    };
}

export const getQueue = async() => {
    return matchMakingQueue.getUsers();
}

export const requeueUser = async(user) => {
    matchMakingQueue.addUser(user);
};