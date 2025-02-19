'use client';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import withAuth from "../../hoc/withAuth.js";
import { useUser } from "@/context/AuthContext.js";
import apiService from '@/components/apiService.js';

function Leaderboard() {
    const { user, loading } = useUser();
    const matchId = "65a7b2c9876c9e001c4f0e20"; // Temporarily Hardcoded Match ID (Testing Purpose)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const res = await apiService.leaderboard();
            console.log('response', res)
        }
        fetchLeaderboard();
    });

    if (loading) {
        return <p className="text-center text-white text-2xl">Loading...</p>;
    }

    if (!user) {
        return <p className="text-center text-white text-2xl">User not found</p>;
    }

    return (
        <div
            className="min-h-screen pt-20 w-full bg-cover bg-center flex items-center justify-center"
            style={{
                backgroundImage: "url(/Images/leaderboardBackground.jpeg)", // Background image
                backgroundSize: "cover", // Ensure the background image covers the full screen
                backgroundRepeat: "no-repeat"
            }}
        >
            <Navbar />

            <div className="w-full max-w-4xl mx-auto text-center p-8 bg-opacity-50 bg-white">
                {/* Title Section */}
                <div className="text-[#152669DB] sm:text-xl md:text-2xl lg:text-3xl font-alegreya font-semibold">
                    <div>WHERE PASSION MEETS PERSEVERANCE,</div>
                    <p>
                        VICTORY FINDS ITS PLACE ON THE
                        {' '}
                        <span className='text-[#305612] font-bold'>LEADERBOARD</span>
                        {'.'}
                    </p>
                </div>

                {/* User Greeting */}
                <div className="my-5">
                    <div className="text-2xl font-aleo font-bold">
                        <div>Hii, {user.username}</div>
                    </div>
                </div>

                {/* Button Section */}
                <div className="bg-[#5672B8]/30 shadow-lg rounded-xl p-3 pb-5">
                    <div className="w-1/2 mx-auto">
                        <Button text='Live Contest' color='white' />
                    </div>
                    <div className="bg-[#040B29DB]/50 backdrop-blur-md shadow-lg w-full h-28 rounded-lg mt-3"></div>

                    {/* Equal Distribution of Buttons */}
                    <div className="flex justify-evenly items-center gap-3 font-medium text-white mt-5">
                        <button className='bg-[#0A044033] px-4 py-1 rounded-md w-full sm:w-auto'>
                            Rank
                        </button>
                        <button className='bg-[#0A044033] text-[#0A0440] px-4 py-1 rounded-md w-full sm:w-auto'>
                            Points
                        </button>
                        <button className='bg-[#0A044033] text-[#305612] px-4 py-1 rounded-md w-full sm:w-auto'>
                            Winning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(Leaderboard);