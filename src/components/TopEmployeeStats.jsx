import React, { useEffect, useState } from "react";
import {
    FaWarehouse,
    FaUser,
    FaTrophy,
    FaCrown
} from "react-icons/fa";

function TopEmployeesStats({ groupedData }) {
    const [topEmployees, setTopEmployees] = useState({});

    const calculateDuration = (firstTime, lastTime) => {
        if (!firstTime || !lastTime) return "N/A";

        const first = new Date(firstTime);
        const last = new Date(lastTime);
        const diffMs = last - first;

        if (diffMs < 0) return "Invalid";

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    useEffect(() => {
        // Calculate top 5 employees for each location
        const topEmployeesByLocation = {};

        Object.entries(groupedData).forEach(([location, employees]) => {
            const employeesArray = Object.entries(employees)
                .map(([employee, info]) => ({
                    employee: employee?.split(" / ")[0],
                    orderCount: info.orderIds.size,
                    duration: calculateDuration(info.firstTime, info.lastTime),
                    location: location
                }))
                .sort((a, b) => b.orderCount - a.orderCount)
                .slice(0, 5); // Top 5 only

            topEmployeesByLocation[location] = employeesArray;
        });

        setTopEmployees(topEmployeesByLocation);
    }, [groupedData]);

    const getRankBadge = (index) => {
        switch (index) {
            case 0:
                return {
                    bg: "bg-gradient-to-r from-yellow-400 to-yellow-500",
                    text: "text-white",
                    icon: <FaCrown className="text-sm" />,
                    label: "1st"
                };
            case 1:
                return {
                    bg: "bg-gradient-to-r from-gray-400 to-gray-500",
                    text: "text-white",
                    icon: <FaCrown className="text-sm" />,
                    label: "2nd"
                };
            case 2:
                return {
                    bg: "bg-gradient-to-r from-orange-400 to-orange-500",
                    text: "text-white",
                    icon: <FaCrown className="text-sm" />,
                    label: "3rd"
                };
            default:
                return {
                    bg: "bg-blue-500",
                    text: "text-white",
                    icon: null,
                    label: `${index + 1}`
                };
        }
    };

    const Table = ({ location, employees }) => (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FaWarehouse className="text-lg text-purple-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{location?.split(" / ")[0]}</h3>
                            <p className="text-gray-300 text-sm">{employees.length} Top Performers</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                            <FaTrophy className="text-yellow-400" />
                            <span className="text-sm font-semibold">Top 5</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Employee Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Orders
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((emp, index) => {
                            const rankBadge = getRankBadge(index);
                            const isTopThree = index < 3;

                            return (
                                <tr
                                    key={emp.employee}
                                    className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${isTopThree ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''
                                        }`}
                                >
                                    {/* Rank */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${rankBadge.bg} ${rankBadge.text} font-bold text-sm`}>
                                            {isTopThree ? rankBadge.icon : rankBadge.label}
                                        </div>
                                    </td>

                                    {/* Employee Name */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isTopThree ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-gray-100'
                                                }`}>
                                                <FaUser className={`text-sm ${isTopThree ? 'text-blue-600' : 'text-gray-600'}`} />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${isTopThree ? 'text-blue-800' : 'text-gray-900'
                                                    }`}>
                                                    {emp.employee?.split(" / ")[0]}
                                                </div>
                                                <div className="text-xs text-gray-500">{emp.location?.split(" / ")[0]}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Duration */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {emp.duration}
                                        </div>
                                    </td>

                                    {/* Orders */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`
                                            inline-flex items-center px-3 py-1 rounded-full text-sm font-bold
                                            ${isTopThree ?
                                                'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' :
                                                'bg-green-100 text-green-800'
                                            }
                                        `}>
                                            {emp.orderCount}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {employees.length === 0 && (
                    <div className="text-center py-12">
                        <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No employee data available</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full bg-white p-6 overflow-auto">
            <div className="w-full mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Object.entries(topEmployees).map(([location, employees]) => (
                        <Table
                            key={location}
                            location={location}
                            employees={employees}
                        />
                    ))}
                </div>

                {Object.keys(topEmployees).length === 0 && (
                    <div className="text-center py-12">
                        <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No employee data available for ranking</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopEmployeesStats;