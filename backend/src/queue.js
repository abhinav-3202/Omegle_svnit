class MatchMakingQueue {
    constructor(){
        this.users = [];
    }

    addUser(user){
        this.users.push(user);
    }

    removeUser(userId){
        this.users = this.users.filter(
            user => user._id.toString() !== userId.toString()
        ); // overwriting the users array with a new array that excludes the user with the specified userId
    }

    getUsers(){
        return this.users;
    }

    findMatch(user){
        for(const waitingUser of this.users){
            if(waitingUser._id.toString() === user._id.toString()){
                continue;
            }

            const commonInterests=user.interests.filter(
                interest => waitingUser.interests.includes(interest)
            );

            const commonSkills = user.skills.filter(
                skill=>waitingUser.skills.includes(skill)
            );

            if(commonInterests.length>0 || commonSkills.length>0){
                return waitingUser;
            }
        }

        return null;

    }
}

export default MatchMakingQueue;