import Axios from 'axios'
import Navbar from "../components/Navbar"
import Head from 'next/head';
import {useState, useEffect} from "react"

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([])
    
    // get leaderboard from database
    useEffect(() => {
        Axios.get("http://localhost:3001/get-leaderboard").then((response) => {
            setLeaderboard(JSON.parse(response.data[0].rankings).leaderboard) 
        })
    }, [])

    return (
        <div>
            <Head>
                <title>Typer: Leaderboard</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Navbar/>
                <div className="p-5">
                    <h1 className="text-center font-bold mb-4 text-2xl lg:text-4xl">Leaderboard</h1>
                    <div className="pt-5">
                        {/* the leaderboard section */}
                        <table className="table-auto">
                            <tr className="w-100">
                                <th className="w-[20vw]">Rank</th>
                                <th className="w-[55vw]">Username</th>
                                <th className="w-[20vw]">Score</th>
                            </tr>
                            {leaderboard.map((user, rank) => {
                                return (
                                    <tr className="w-100">
                                        <td className="w-[20vw] text-center pt-2">{rank+1}</td>
                                        <td className="w-[55vw] text-center pt-2">{user[0]}</td>
                                        <td className="w-[20vw] text-center pt-2">{user[1]}</td>
                                    </tr>
                                )
                            })}
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}