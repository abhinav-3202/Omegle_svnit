import MatchMakingQueue from "../queue.js";

const matchMakingQueue = new MatchMakingQueue();

export default matchMakingQueue;

// this created a single instance of queue to keep all matches in a single queue

// If User A enters through one request and User B enters through another request, both interact with the same queue.