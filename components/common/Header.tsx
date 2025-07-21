import React from "react";
import {BsFillPersonFill} from "react-icons/bs";


export const Header: React.FC<{ id: string }> = ({id}) => {
    return (
        <>
            <div className="navbar bg-white text-black rounded-xl shadow-sm">
                <div tabIndex={0} role="button" className="items-center btn-circle ">
                    <div className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center">
                        <span className="text-white items-center text-xl">{id}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <a className="ml-2 btn btn-ghost hover:bg-gray-600 hover:text-white text-xl">Bàn số {id}</a>
                </div>
                <div className="flex-none">
                    <div className="dropdown dropdown-end">
                        <div className="mt-3 btn-circle">
                            <div className="indicator">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ml-4 items-center btn-circle">
                    <BsFillPersonFill className="text-4xl"/>
                </div>
            </div>
        </>
    )
}