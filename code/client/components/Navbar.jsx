import Link from "next/link"
import { useState } from "react";

export default function Navbar() {
    const [navbarOpen, setNavbarOpen] = useState(false);
    return (
        <nav className="p-3 border-gray-200 rounded bg-gray-50 bg-gray-800 border-gray-700">
            <div className="container flex flex-wrap items-center justify-between mx-auto">
                <a href="#" className="flex items-center">
                    <img src="https://flowbite.com/docs/images/logo.svg" className="h-6 mr-3 sm:h-10" alt="Flowbite Logo" />
                    <span className="self-center text-xl font-semibold whitespace-nowrap text-white">typer</span>
                </a>
                <button data-collapse-toggle="navbar-solid-bg" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
                    onClick={() => setNavbarOpen(!navbarOpen)}>
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                </button>
                <div className={"w-full md:block md:w-auto"+
                     (navbarOpen ? "" : " hidden")
                     } id="navbar-solid-bg">
                    <ul className="flex flex-col mt-4 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-transparent bg-gray-800 md:bg-transparent border-gray-700">
                        <li>
                            <Link href="/" className=" block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-white md:p-0 md:text-white bg-blue-600 md:bg-transparent" aria-current="page">Home</Link>
                        </li>
                        <li>
                            <Link href="/type" className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 text-gray-400 md:hover:text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent">Type</Link>
                        </li>
                        <li>
                            <Link href="/leaderboard" className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 text-gray-400 md:hover:text-white hover:bg-gray-700 hover:text-white md:hover:bg-transparent">Leaderboard</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

