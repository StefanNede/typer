// component for the end screen that shows on the completion of a multiplayer test
import Axios from 'axios'
import { useState, useEffect, useMemo } from 'react'

export default function MultiEnd({ roomName, roomCreator, userResults, setJoinedRoom, userDetails, setUserDetails, socket }) {
    const [leaderboardArray, setLeaderboardArray] = useState([])
    const [leaderboardFetched, setLeaderboardFetched] = useState(false)
    let userScores = userResults[0]

    const sortScores = (userScores) => {
        // sort descending by value (WPM score)
        // convert object to 2d array
        let sortedArr = []
        for (var user in userScores) {
            sortedArr.push([user, userScores[user]])
        }

        // use in-built javascript function to sort descending
        sortedArr.sort(function(a, b) {
            return b[1] - a[1]
        })

        return sortedArr
    }

    const updateHighScore = (userScores) => {
        // compare user score with stored high scores in userDetails and send POST request to update high score if necessary
        let userScore = userResults[0][userDetails.username] // the user's score 
        let newBestScore = userDetails.bestScore // variable to store user's best score
        let userWins = userDetails.numWins // variable to store the user's win count
        let userLosses = userDetails.numLosses // variable to store the user's loss count

        // updating user's best score
        if (userScore > userDetails.bestScore) {
            newBestScore = userScore
        }

        // updating user's win and loss count
        if (userDetails.username === userScores[0][0]) {
            userWins += 1
        } else {
            userLosses += 1
        }

        // send POST request to database to update user details
        Axios.post("http://localhost:3001/update-userInfo", {username:userDetails.username, bestScore:newBestScore, numWins:userWins, numLosses:userLosses}).then((response) => {
            console.log(response)
        })

        // update userDetails
        setUserDetails(
            {username:userDetails.username, 
            bestScore:newBestScore, 
            bestAccuracy:userDetails.bestAccuracy, 
            numWins:userWins, 
            numLosses:userLosses, 
            userID:userDetails.userID, 
            password:userDetails.password}
        )
    }

    userScores = sortScores(userScores)

    useEffect(() => {
        updateHighScore(userScores)
        // getting the leaderboard
        Axios.get("http://localhost:3001/get-leaderboard").then((response) => {
            setLeaderboardArray(JSON.parse(response.data[0].rankings).leaderboard) // store to state variable to be ammended
            setLeaderboardFetched(true) // to trigger updating of the leaderboard 
        })
    }, [])

    useEffect(() => {
        // updating the leaderboard
        if (leaderboardFetched) {
            console.log("NEW LEADERBOARD")
            // insert userScores into array then sort array then slice array to only have top 100 scores
            let interLeaderboard = [] // intermediate leaderboard
            
            // inserting into array
            for (let leaderboardUser of leaderboardArray) {
                interLeaderboard.push(leaderboardUser)
            }
            for (var user in userResults[0]) {
                interLeaderboard.push([user, userResults[0][user]])
            }

            // sorting array
            interLeaderboard.sort(function(a, b) {
                return b[1] - a[1]
            })

            // slicing array
            let top100 = interLeaderboard.slice(0, 100)

            // update database
            Axios.post("http://localhost:3001/update-leaderboard", {newLeaderboard:top100}).then((response) => {
                console.log(response)
            })
        }
    }, [leaderboardFetched])

    return (
        <div>
            <h2 className="text-center text-3xl">RESULTS</h2>
            <div className="mt-[5vh]">
                <ol className="">
                    {userScores.map((user, i) => {
                        return (
                            <li style={{color:(i===0 ? "lightGreen" : "white")}} className="flex justify-around mb-[3vh]">
                                <h4 className="flex text-xl">
                                    <p >{i+1}. </p> 
                                    <p className="font-bold ml-1"> {user[0]}</p>
                                </h4>
                                <p className="text-xl">{user[1]} wpm</p>
                            </li>
                        )
                    })}
                </ol>
            </div>
        </div>
    )
}