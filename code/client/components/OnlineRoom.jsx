import Axios from 'axios'
import { useState, useEffect, useMemo } from 'react'
import OnlineTest from './OnlineTest'
import MultiEnd from './MultiEnd'

export default function OnlineRoom( { roomName, roomCreator, joinedRoom, setJoinedRoom, roomTest, userDetails, setUserDetails, socket } ) {
    const [userList, setUserList] = useState([userDetails.username])
    const [userResults, setUserResults] = useState([{}]) // store results for every user
    const [userWayThrough, setUserWayThrough] = useState([{}]) // store the amount through the test every user is

    const [startTime, setStartTime] = useState(0)
    const [usersFinished, setUsersFinished] = useState(0) // holds a count of the number of users that have finished typing the test

    const [showEndScreen, setShowEndScreen] = useState(false)

    const [roomTimer, setRoomTimer] = useState(1) // holds the time left in the room timer

    const sliderColours = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-yellow-500"]

    Axios.defaults.withCredentials = true

    const leaveRoom = () => {
        console.log("leaving room")

        // socket stuff
        socket.emit("leave_room", {roomName:roomName, username:userDetails.username})

        Axios.post("http://localhost:3001/leave-room", {roomName: roomName, userLeaving: userDetails}).then((response) => {
            console.log(response)
        })
        setJoinedRoom(false)
    }

    const deleteRoom = () => {
        console.log("deleting room")

        // socket stuff
        socket.emit("leave_room", {roomName:roomName, username:userDetails.username})

        Axios.post("http://localhost:3001/delete-room", {roomName: roomName, roomCreator: roomCreator}).then((response) => {
            console.log(response)
        })
        setJoinedRoom(false)
    }

    useMemo(() => {
        socket.on("update_user_list", (data) => {
            // console.log("UPDATING USER LIST")
            // console.log(data)
            setUserList(data)
            let userRes = {}
            let userWay = {}
            for (let user of data) {
                userRes[user] = 0
                userWay[user] = 0
            }
            let dummyArr1 = []
            let dummyArr2 = []
            dummyArr1.push(userRes)
            dummyArr2.push(userWay)
            setUserResults(dummyArr1)
            setUserWayThrough(dummyArr2)
        })

        socket.on("update_user_sliders", (data) => {
            console.log("UPDATING USER SLIDERS")
            console.log(data)
            let userUpdated = data[0]
            let newWordIndex = data[1]
            let newUserWay = userWayThrough[0]
            // divide by total number of words (50) and multiply by width of bar (60) to get
            // amount of vw needed for the left margin when rendering
            newUserWay[userUpdated] = (newWordIndex/50)*60
            let dummyArr1 = []
            dummyArr1.push(newUserWay)
            setUserWayThrough(dummyArr1)
        })

        socket.on("update_user_wpm", (data) => {
            console.log("UPDATING USER WPM SCORES")
            console.log(data)
            let userUpdated = data[0]
            let newWPMscore = Math.round(data[1]) // round WPM score to 0dp
            let newUserResult = userResults[0]
            newUserResult[userUpdated] = newWPMscore
            let dummyArr1 = []
            dummyArr1.push(newUserResult)
            setUserResults(dummyArr1)
        })

    }, [socket])

    useEffect(() => {
        if (userList.length === 5) {
            let start = new Date()
            setStartTime(start.getTime())
            // start countdown
            setRoomTimer(120)
        }
    }, [userList])

    useEffect(() => {
        if (roomTimer <= 0) {
            // test auto ends
            setShowEndScreen(true)
        }

        roomTimer > 0 && userList.length === 5 && setTimeout(() => {
            setRoomTimer(roomTimer-1)
        }, 1000)

    }, [roomTimer])

    useEffect(() => {
        if (usersFinished === 5) {
            console.log("test is over")
            setShowEndScreen(true)
        }
    }, [usersFinished])

    return (
        <div>
            <header className="flex justify-between">
                <h1>{roomName}</h1>
                <div>
                    <button className="bg-white text-black rounded px-2" onClick={leaveRoom}>leave</button>
                    { roomCreator === userDetails.username ? 
                        <button className="bg-white text-black rounded px-2" onClick={deleteRoom}>delete</button>
                        :
                        <></>
                    }
                </div>
            </header>
            { showEndScreen ? 
                <MultiEnd roomName={roomName} roomCreator={roomCreator} userResults={userResults} setJoinedRoom={setJoinedRoom} userDetails={userDetails} setUserDetails={setUserDetails} socket={socket} />
            :
            <>
                <h3 className="text-center text-3xl font-semibold text-blue-300">{roomTimer}</h3>
                <div>
                    {/* area that shows the users */}
                    <ul className="h-[30vh] flex flex-col mt-[5vh] mx-[5vw]">
                        {userList.map((user, i) => {

                            return (<li className="mb-[5vh] flex items-center ">
                                        <p className="text-xl font-bold w-[13vw]">{user}</p>
                                        <div className="bg-blue-200">
                                            {/* user slider */}
                                            <div style={{marginLeft:`${userWayThrough[0][user]}%`}} className={` ${sliderColours[i]} mt-[-1.2vh] h-[3vh] w-[3vh] rounded-full absolute`}>
                                                {/* the circle indicating user position*/}
                                            </div>
                                            <div className="bg-white h-[0.5vh] w-[60vw] "> 
                                                {/* the line */}
                                            </div>
                                        </div>
                                        <p className="w-[15vw] text-right text-xl">{userResults[0][user]} wpm</p>
                                    </li>)
                        })}
                    </ul>

                </div>
                <div>
                    <OnlineTest text={roomTest} socket={socket} username={userDetails.username} roomName={roomName} startTime={startTime} usersFinished={usersFinished} setUsersFinished={setUsersFinished} />
                </div>
            </>
            }
        </div>
    )
}