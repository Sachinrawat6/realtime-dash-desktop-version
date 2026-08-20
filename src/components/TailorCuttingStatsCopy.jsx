import React, { useEffect, useState } from "react";
import { FaTshirt, FaUser, FaStopwatch, FaCalendarAlt, FaClock, FaCut, FaCrown } from "react-icons/fa";
import ProductPage from "./ProductPage";

function TailorCuttingStats({ groupedData, employeeScans, recentUpdates, productDetails }) {
    const [tailorData, setTailorData] = useState([]);
    const [cuttingData, setCuttingData] = useState([]);
    const [updatedEmployees, setUpdatedEmployees] = useState(new Set());
    const [isProductShow, setIsProductShow] = useState(false);
    const [locationSelector, setLoacationSelector] = useState("");

    const calculateDuration = (firstTime, lastTime) => {
        if (!firstTime || !lastTime) return "N/A";

        const first = new Date(firstTime);
        const last = new Date(lastTime);
        const diffMs = last - first;

        if (diffMs < 0) return "Invalid";

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };



    useEffect(() => {
        const tailorArray = [];
        const cuttingArray = [];

        Object.entries(groupedData).forEach(([location, employees]) => {
            const loc = location.toLowerCase();

            Object.entries(employees).forEach(([employee, info]) => {
                const employeeData = {
                    location,
                    employee,
                    orderCount: info.orderIds.size,
                    duration: calculateDuration(info.firstTime, info.lastTime),
                    firstScan: info.firstTime,
                    lastScan: info.lastTime,
                    scanCount: employeeScans[location]?.[employee]?.length || 0
                };

                const isTailor = loc.includes("tailor scan 2");
                const isCuttingMaster = loc.includes("cutting") || loc.includes("master");

                // --- FILTER LOGIC FIXED ---
                if (locationSelector === "tailor") {
                    if (isTailor) tailorArray.push(employeeData);
                }
                else if (locationSelector === "cutting master") {
                    if (isCuttingMaster) cuttingArray.push(employeeData);
                }
                else {
                    // default: show all (no selector)
                    if (isTailor) tailorArray.push(employeeData);
                    if (isCuttingMaster) cuttingArray.push(employeeData);
                }
            });
        });

        // Sorting
        tailorArray.sort((a, b) => b.orderCount - a.orderCount);
        cuttingArray.sort((a, b) => b.orderCount - a.orderCount);

        setTailorData(tailorArray);
        setCuttingData(cuttingArray);
    }, [groupedData, employeeScans, locationSelector]);


    useEffect(() => {
        if (recentUpdates && recentUpdates.length > 0) {
            const newUpdatedEmployees = new Set();

            recentUpdates.forEach(update => {
                const employeeKey = `${update.location}-${update.employee}`;
                newUpdatedEmployees.add(employeeKey);
                console.log(`Animation triggered for: ${update.employee} at ${update.location}`);
            });

            setUpdatedEmployees(newUpdatedEmployees);
            setIsProductShow(true)

            // Clear animation after 2 seconds
            const timer = setTimeout(() => {
                setUpdatedEmployees(new Set());
            }, 5000);
            return () => clearTimeout(timer);

        }
    }, [recentUpdates]);

    const formatTime = (timestamp) => {
        if (!timestamp) return "N/A";
        return new Date(timestamp).toLocaleTimeString();
    };

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
                    bg: "bg-gray-100",
                    text: "text-gray-600",
                    icon: null,
                    label: `${index + 1}`
                };
        }
    };

    // TableRow component with proper HTML structure
    const TableRow = ({ item, index, isUpdated }) => {
        const rankBadge = getRankBadge(index);
        const isTopThree = index < 3;

        return (
            <tr
                className={`
                    relative transition-all duration-300
                    ${isTopThree && !isUpdated ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-gray-50'}
                    ${isUpdated ? 'ring-2 ring-green-400  bg-green-500 ring-opacity-50' : ''}
                `}
            >
                {/* Background highlight using CSS pseudo-element instead of div */}
                {isUpdated && (
                    <style>
                        {`
                        .row-highlight-${item.location.replace(/\s+/g, '-')}-${item.employee.replace(/\s+/g, '-')}::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: linear-gradient(90deg, 
                                rgba(34, 197, 94, 0.2) 0%, 
                                rgba(34, 197, 94, 0.4) 50%, 
                                rgba(34, 197, 94, 0.2) 100%);
                            animation: slideHighlight 4s ease-in-out forwards;
                            z-index: 0;
                            border-radius: 4px;
                        }
                        `}
                    </style>
                )}

                <td className={`px-6 py-2 whitespace-nowrap relative z-10 ${isUpdated ? `row-highlight-${item.location.replace(/\s+/g, '-')}-${item.employee.replace(/\s+/g, '-')}` : ''}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${rankBadge.bg} ${rankBadge.text} font-bold text-sm`}>
                        {isTopThree ? rankBadge.icon : rankBadge.label}
                    </div>
                </td>

                <td className="px-6 py-2 whitespace-nowrap relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isTopThree ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-blue-100'
                            } ${isUpdated ? 'ring-2 ring-green-500' : ''}`}>
                            <FaUser className={`text-sm ${isTopThree ? 'text-blue-600' : 'text-blue-500'} ${isUpdated ? 'text-green-600' : ''}`} />
                        </div>
                        <div>
                            <div className={`text-sm font-semibold ${isTopThree ? 'text-blue-800' : 'text-gray-900'
                                } ${isUpdated ? 'text-green-800 font-bold' : ''}`}>
                                {item.employee?.split(" / ")[0]}
                                {isUpdated && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        LIVE
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">{item.location?.split(" / ")[0]}</div>
                        </div>
                    </div>
                </td>

                {/* <td className="px-6 py-2 whitespace-nowrap relative z-10">
                    <div className={`text-sm font-bold ${isTopThree ? 'text-purple-700' : 'text-gray-900'
                        } ${isUpdated ? 'text-green-700' : ''}`}>
                        {item.scanCount}
                    </div>
                </td> */}

                <td className="px-6 py-2 whitespace-nowrap relative z-10">
                    <div className="flex items-center gap-2">
                        <FaStopwatch className={`text-sm ${isTopThree ? 'text-purple-600' : 'text-purple-500'
                            }`} />
                        <span className={`text-sm font-semibold ${isTopThree ? 'text-purple-800' : 'text-gray-900'
                            }`}>
                            {item.duration}
                        </span>
                    </div>
                </td>

                <td className="px-6 py-2 whitespace-nowrap relative z-10">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className={`text-sm ${isTopThree ? 'text-blue-600' : 'text-blue-500'
                            }`} />
                        <span className={`text-sm ${isTopThree ? 'text-blue-800' : 'text-gray-900'
                            }`}>
                            {formatTime(item.firstScan)}
                        </span>
                    </div>
                </td>

                <td className="px-6 py-2 whitespace-nowrap relative z-10">
                    <div className="flex items-center gap-2">
                        <FaClock className={`text-sm ${isTopThree ? 'text-orange-600' : 'text-orange-500'
                            }`} />
                        <span className={`text-sm ${isTopThree ? 'text-orange-800' : 'text-gray-900'
                            }`}>
                            {formatTime(item.lastScan)}
                        </span>
                    </div>
                </td>

                <td className="px-6 py-2 whitespace-nowrap relative z-10">
                    <div className="flex items-center gap-2">

                        <span className={`text-sm ${isTopThree ? 'text-orange-800' : 'text-gray-900'
                            }`}>
                            {isUpdated && productDetails[0]?.orders_2?.style_number || "_"}
                        </span>
                    </div>
                </td>

                <td className="px-6 py-2 whitespace-nowrap relative z-10">
                    <span className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-bold
                        ${isTopThree ?
                            'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' :
                            'bg-green-100 text-green-800'
                        }
                    `}>
                        {item.orderCount}
                    </span>
                </td>
            </tr>
        );
    };

    const Table = ({ title, data, icon, iconColor }) => (
        <div className="bg-white rounded-2xl border border-gray-200">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-2 rounded-lg text-white">
                <div className="flex items-center gap-3">
                    <div className={`p-3 ${iconColor} rounded-xl`}>
                        {icon}
                    </div>
                    <div className="flex justify-between px-10 w-full items-center">
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-gray-300">{data.length} Employees</p>
                    </div>
                </div>
            </div>

            <div className="">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Employee Name
                            </th>
                            {/* <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Scan Count
                            </th> */}
                            <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Total Duration
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                1st Scan
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                2nd Scan
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Style
                            </th>
                            <th className="px-6 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Scan
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <TableRow
                                key={`${item.location}-${item.employee}`}
                                item={item}
                                index={index}
                                isUpdated={updatedEmployees.has(`${item.location}-${item.employee}`)}
                            />
                        ))}
                    </tbody>
                </table>

                {data.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-4xl mb-3">📊</div>
                        <p className="text-gray-500 text-lg">No data available</p>
                    </div>
                )}
            </div>
        </div>
    );

    if (isProductShow) {
        console.log("Product page show")
        setTimeout(() => {
            setIsProductShow(false)
        }, 5000);
        return <ProductPage data={productDetails} />
    }

    return (
        <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-2 overflow-auto">
            {/* Global CSS for animation */}
            <style>
                {`
                @keyframes slideHighlight {
                    0% {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    20% {
                        transform: translateX(-50%);
                        opacity: 0.5;
                    }
                    50% {
                        transform: translateX(0%);
                        opacity: 0.8;
                    }
                    80% {
                        transform: translateX(50%);
                        opacity: 0.5;
                    }
                    100% {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                `}
            </style>

            <div>
                <select onChange={(e) => setLoacationSelector(e.target.value)} className="border border-gray-400 py-2 px-4 cursor-pointer rounded-lg w-full mb-2 outline-gray-300">
                    <option value="" >Select All</option >
                    <option value="cutting master" >Cutting Master</option >
                    <option value="tailor" >Tailor</option >
                </select>
            </div>

            {/* Live Updates Indicator */}
            {updatedEmployees.size > 0 && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="font-bold">{updatedEmployees.size} Employee{updatedEmployees.size > 1 ? 's' : ''} Updated</span>
                    </div>
                </div>
            )}


            {
                !locationSelector ? (
                    <div className="full">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                            <Table
                                title="Cutting Master Performance"
                                data={cuttingData}
                                icon={<FaCut className="text-2xl text-green-300" />}
                                iconColor="bg-green-500/20"
                            />
                            <Table
                                title="Tailor Performance"
                                data={tailorData}
                                icon={<FaTshirt className="text-2xl text-blue-300" />}
                                iconColor="bg-blue-500/20"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="full">

                        <Table
                            title={`${locationSelector === "cutting master" ? "Cutting Master Performance" : "Tailor Performance"}`}
                            data={locationSelector === "cutting master" ? cuttingData : tailorData}
                            icon={locationSelector === "cutting master" ? <FaCut className="text-2xl text-green-300" /> : <FaTshirt className="text-2xl text-blue-300" />}
                            iconColor="bg-green-500/20"
                        />

                    </div>
                )
            }



        </div>
    );
}

export default TailorCuttingStats;