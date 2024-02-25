class Users {

    /* the users  array will hold objects for each user that look like this:
    [{
        socket_id: "jsdkjflkajlf",
        username: "username1",
        roomName: "room1"
    }] */

    constructor() {
        this.users = []
    }

    addUser(socket_id, username, roomName) {
        // adding a new user to the 'users' list
        let user = {socket_id, username, roomName}
        this.users.push(user)
        return user
    }

    getUserList(roomName) {
        // getting the user list for the users connected to a particular room
        let users = [] // stores a list of the objects
        let usernames = [] // stores lists of usernames of users connected to room
        for (let user of this.users) {
            if (user.roomName === roomName) {
                users.push(user)
                usernames.push(user.username)
            }
        }
        return usernames
    }

    getUser(socket_id) {
        // getting user with a specific socket_id
        return this.users.filter((user) => user.socket_id === socket_id)[0]
    }

    removeUser(socket_id) {
        // removing a user with the given socket_id from the users list
        let user = this.getUser(socket_id)

        if (user) {
            // update users list to no longer hold that user
            this.users = this.users.filter((user) => user.socket_id !== socket_id)
        } else {
            console.log("user with socket id - " + socket_id + " - does not exist")
        }

        return user
    }
}

module.exports = {Users}