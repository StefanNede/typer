import Head from 'next/head';
import Navbar from "../components/Navbar";
import Layout from '../components/layout';
import Axios from "axios";
import { useState, useEffect } from "react";
import Stats from '../components/Stats';

export default function Home() {
  // variables for logging in
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [userDetails, setUserDetails] = useState({})

  // variables for when registering
  const [usernameReg, setUsernameReg] = useState("")
  const [passwordReg, setPasswordReg] = useState("")

  const [loginStatus, setLoginStatus] = useState("Not logged in")
  const [loginBool, setLoginBool] = useState(false)

  // for cookies
  Axios.defaults.withCredentials = true

  // registering
  const register = () => {
    // for debugging purposes
    console.log(`registering with username ${usernameReg} and password ${passwordReg}`)

    Axios.post("http://localhost:3001/register", {username: usernameReg, password: passwordReg}).then((response) => {

      if (response.data) {
        // if there has been an error -> username already in use alert it to the user
        alert(response.data.message)
      }

      console.log(response)
    })
  }

  // logging in
  const login = () => {
    Axios.post("http://localhost:3001/login", {username: username, password: password}).then((response) => {
      let data = response.data
      console.log(data)
      if (data.message) {
        setLoginStatus("Not logged in")
        setLoginBool(false)
        alert(data.message)
      } else {
        // user logged in
        setUserDetails(data[0])
        setLoginStatus("Logged in as: " + data[0].username)
        setLoginBool(true)
      }
    })
  }

  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn) {
        setUserDetails(response.data.user[0])
        setLoginStatus("Logged in as: " + response.data.user[0].username)
        setLoginBool(true)
      }
    })
  }, [])

  useEffect(() => {
    console.log(userDetails)
  }, [userDetails])

  return (
    <Layout>
      <div >
        <Head>
          <title>Typer: Home</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <Navbar/>
            <div className="p-5 h-[89vh]">
              <h1 className="text-center font-bold mb-4 text-2xl lg:text-4xl">Home</h1>
              {
                // conditionally render stats page if logged in, otherwise registering and logging in forms
                loginBool ? 
                  <Stats userDetails={userDetails} setLoginBool={setLoginBool} setLoginStatus={setLoginStatus}/>
                  :
                  <div className="pt-[5vh] flex flex-row justify-around h-[70vh]">
                    {/* register & login section */}
                    <div className="flex flex-col items-center justify-evenly h-[50vh] w-[50vw]">
                      {/* register section */}
                      <h3 className="text-xl">register</h3>
                      <div className="flex flex-col h-[40vh] justify-evenly ">
                          <div className="flex flex-col">
                              <label className="pb-1">Username</label>
                              <input type="text" onChange={(event) => setUsernameReg(event.target.value)} className="px-2 py-1 rounded text-black"/>
                          </div>
                          <div className="flex flex-col">
                              <label className="pb-1">Password</label>
                              <input type="text" onChange={(event) => setPasswordReg(event.target.value)} className="px-2 py-1 rounded text-black"/>
                          </div>
                      </div>
                      <button onClick={register} className="text-black bg-white rounded px-1 py-0.5 border-black">register</button>
                    </div>
                    <div className="flex flex-col items-center justify-evenly h-[50vh] w-[50vw]">
                      {/* login section */}
                      <h3 className="text-xl">login</h3>
                      <div className="flex flex-col h-[40vh] justify-evenly ">
                          <div className="flex flex-col">
                              <label className="pb-1">Username</label>
                              <input type="text" onChange={(event) => setUsername(event.target.value)} className="px-2 py-1 rounded text-black"/>
                          </div>
                          <div className="flex flex-col">
                              <label className="pb-1">Password</label>
                              <input type="text" onChange={(event) => setPassword(event.target.value)} className="px-2 py-1 rounded text-black"/>
                          </div>
                      </div>
                      <button onClick={login} className="text-black bg-white rounded px-1 py-0.5 border-black">login</button>
                    </div>
                  </div>
              }
              <p className="text-center">{loginStatus}</p>
            </div>
       </main>
      </div>
    </Layout>
  );
}




