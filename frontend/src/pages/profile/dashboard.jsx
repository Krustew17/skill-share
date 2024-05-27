import React from "react";

import { GoPersonFill } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { MdBackpack } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import ProfileTabContent from "./tabcontents/profile.tabcontent";

const Dashboard = ({ activeTab, handleTabClick }) => {
    return (
        <div className="w-1/4 bg-white dark:bg-gray-700 dark:text-white p-4 shadow-lg rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                Dashboard
            </h2>
            <ul>
                <li
                    className={`cursor-pointer text-xl mt-5 flex gap-2 ${
                        activeTab === 1
                            ? "text-blue-500"
                            : "text-gray-700 dark:text-gray-200"
                    } hover:text-blue-500`}
                    onClick={() => handleTabClick(1)}
                >
                    <GoPersonFill className="text-3xl" /> Profile
                </li>
                <li
                    className={`cursor-pointer text-xl mt-1 flex gap-2 ${
                        activeTab === 2
                            ? "text-blue-500"
                            : "text-gray-700 dark:text-gray-200"
                    } hover:text-blue-500`}
                    onClick={() => handleTabClick(2)}
                >
                    <FaStar className="text-3xl" /> Talent Cards
                </li>
                <li
                    className={`cursor-pointer text-xl mt-1 flex gap-2 ${
                        activeTab === 3
                            ? "text-blue-500"
                            : "text-gray-700 dark:text-gray-200"
                    } hover:text-blue-500`}
                    onClick={() => handleTabClick(3)}
                >
                    <MdBackpack className="text-3xl" /> Jobs
                </li>
                <li
                    className={`cursor-pointer text-xl mt-1 flex gap-2  ${
                        activeTab === 4
                            ? "text-blue-500"
                            : "text-gray-700 dark:text-gray-200"
                    } hover:text-blue-500`}
                    onClick={() => handleTabClick(4)}
                >
                    <RiLockPasswordFill className="text-3xl" /> Change Password
                </li>
            </ul>
        </div>
    );
};

export default Dashboard;