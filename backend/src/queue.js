class MatchMakingQueue {
    constructor(){
        this.users = [];
    }

    addUser(user){
        const userId = user._id.toString();

        const alreadyExists = this.users.some(
            waitingUser => waitingUser._id.toString() === userId
        );

        if(!alreadyExists){
            this.users.push(user);
            return true; // User added successfully
        }
        else return false; // User already exists in the queue
    }

    removeUser(userId){
        const id = userId.toString();
        this.users = this.users.filter(
            user => user._id.toString() !== id
        ); // overwriting the users array with a new array that excludes the user with the specified userId
    }

    isUserWaiting(userId){
        const id = userId.toString();
        return this.users.some(
            user => user._id.toString() === id
        );
    }

    getUsers(){
        return this.users;
    }

    findMatch(user){
        for(const waitingUser of this.users){
            if(waitingUser._id.toString() === user._id.toString()){
                continue; // Skip if it's the same user semding multiple join queue request
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