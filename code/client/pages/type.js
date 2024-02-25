import Head from 'next/head'
import Navbar from "../components/Navbar"
import Link from "next/link"
import Axios from 'axios'
import io from "socket.io-client"
import {useState, useEffect} from "react"
import OnlineRoom from '../components/OnlineRoom'
import { GetText } from "../scripts/getText"

// this connect backend to frontend
const socket = io.connect("http://localhost:3001")

export default function Type() {
    const [roomName, setRoomName] = useState("")
    const [availableRooms, setAvailableRooms] = useState([])
    const [joinedRoom, setJoinedRoom] = useState(false)
    const [userDetails, setUserDetails] = useState({})
    const [loginBool, setLoginBool] = useState(false)
    const [roomTest, setRoomTest] = useState(GetText(50))
    const [roomCreator, setRoomCreator] = useState("")

    Axios.defaults.withCredentials = true

    const roomNameExists = (name) => {
        for (let room of availableRooms) {
            if (room.roomName === name) {
                return true
            }
        }
        return false
    }

    const createRoom = () => {
        if (roomNameExists(roomName)) {
            // prevent creating a room that has the same room name as one that already exists
            alert(`room ${roomName} already exists`)
        }
        if (!loginBool) {
            // a person who hasn't logged in cannot create a room
            alert("you need to be logged in to create a room")
        }
        if (roomName !== "" && !roomNameExists(roomName) && loginBool) {
            setRoomCreator(userDetails.username)
            setJoinedRoom(true)
            // emit a socket.io signal to state the user has joined a room
            socket.emit("join_room", {roomName:roomName, username:userDetails.username})

            // append room to list of available rooms
            setAvailableRooms([...availableRooms, roomName]) 
            
            // make a POST request to add the room to the table containing a list of existing rooms
            Axios.post("http://localhost:3001/create-room", {roomName: roomName, roomCreator: userDetails.username, test:roomTest}).then((response) => {
                console.log(response)
            })
        }
    }

    const joinRoom = (room) => {
        if (!loginBool) {
            alert("you need to be logged in to participate in multiplayer games")
        } else if (room.numUsers > 5) {
            // there should be a maximum of 5 users in a room
            alert("this room is full")
        } else {
            // socket stuff
            socket.emit("join_room", {roomName:room.roomName, username:userDetails.username})

            // update state variables which are going to be sent to OnlineRoom component
            // needed so correct room gets displayed to the user 
            setRoomName(room.roomName)
            setRoomTest(room.test)
            setRoomCreator(room.roomCreator)
            // send to backend to increment number of people in the room
            Axios.post("http://localhost:3001/join-room", {roomName: room.roomName, numUsers: room.numUsers+1}).then((response) => {
                console.log(response)
            })

            // socket.io signal 
            socket.emit("join-room", room.roomName)
            setJoinedRoom(true)
        }
    }

    // to get what the user is logged in as 
    useEffect(() => {
        Axios.get("http://localhost:3001/login").then((response) => {
            if (response.data.loggedIn) {
                setUserDetails(response.data.user[0])
                setLoginBool(true)
            }
        })
    }, [])

    // to get the list of available rooms
    useEffect(() => {
        Axios.get("http://localhost:3001/get-rooms").then((response) => {
            console.log(response.data)
            if (response.data.message !== "no rooms found") {
                let rooms = []
                for (let room of response.data) {
                    console.log(room)
                    rooms.push(room)
                }
                console.log(rooms)
                setAvailableRooms(rooms)
            }
        })
    }, [])
    console.log(availableRooms)

    return (
        <div>
            <Head>
                <title>Typer: Type</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Navbar/>
                <div className="p-5">
                    <h1 className="text-center font-bold mb-4 text-2xl lg:text-4xl">Type</h1>
                    { !joinedRoom ? 
                        <div className="flex flex-col">
                            <button className="p-1 bg-white rounded">
                                <Link href="/practiceType" className="text-black" aria-current="page">Offline Private Practice</Link>
                            </button>
                            <div className="mt-[5vh]">
                            {/* this will hold the rooms and online features */}
                                <div className="flex flex-row justify-evenly">
                                    {/* create a room */}
                                    <input className="text-black w-[80%] px-2 py-1 rounded" type="text" placeholder="room name..." onChange={(event) => {setRoomName(event.target.value)}}/>
                                    <button className="bg-white text-black rounded px-2" onClick={createRoom}>create room</button>
                                </div>
                                <div className="grid grid-cols-[auto_auto_auto] ">
                                    {/* where the list of available rooms gets rendered */}
                                    {availableRooms.map((availableRoom) => {
                                        return <button className="bg-blue-400 w-[225px] h-[50px] text-base text-white cursor-pointer mx-[5vw] my-[5vh] rounded-[5px] border-[none] " onClick={() => joinRoom(availableRoom)}> {availableRoom.roomName} </button>
                                    })}
                                </div>
                            </div>
                        </div>
                        :
                        <OnlineRoom roomName={roomName} roomCreator={roomCreator} joinedRoom={joinedRoom} setJoinedRoom={setJoinedRoom} roomTest={roomTest} userDetails={userDetails} setUserDetails={setUserDetails} socket={socket} />
                    }
                </div>
            </main>
        </div>
    )
}