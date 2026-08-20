import React, { useEffect, useState } from "react";
import { socket } from "../services/socket";
import {
    FaWarehouse,
    FaUser,
    FaClipboardList,
    FaClock,
    FaCalendarAlt,
    FaBoxOpen,
    FaMapMarkerAlt,
    FaIdBadge,
    FaChartBar,
    FaStopwatch,
    FaListOl
} from "react-icons/fa";

function Dashboard() {
    const [rows, setRows] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [updatedLocations, setUpdatedLocations] = useState(new Set());
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [employeeScans, setEmployeeScans] = useState({});

    // Calculate duration between first and last scan
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
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    // Process scan data for each employee
    const processEmployeeScans = (data) => {
        const scans = {};

        data.forEach((item) => {
            const location = item.locations?.name || "Unknown Location";
            const employee = item.employees?.user_name || "Unknown Employee";
            const orderId = item.order_id;
            const styleNumber = item.orders_2?.style_number || "N/A";
            const timestamp = item.scanned_timestamp;

            if (!scans[location]) {
                scans[location] = {};
            }

            if (!scans[location][employee]) {
                scans[location][employee] = [];
            }

            scans[location][employee].push({
                orderId,
                styleNumber,
                timestamp,
                scannedTime: new Date(timestamp).toLocaleTimeString()
            });
        });

        // Sort by timestamp for each employee
        Object.keys(scans).forEach(location => {
            Object.keys(scans[location]).forEach(employee => {
                scans[location][employee].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            });
        });

        return scans;
    };

    // MAIN LOGIC — GROUP BY LOCATION → EMPLOYEE → UNIQUE ORDER COUNT
    const calculateGroups = (data) => {
        const groups = {};

        data.forEach((item) => {
            const location = item.locations?.name || "Unknown Location";
            const employee = item.employees?.user_name || "Unknown Employee";
            const orderId = item.order_id;
            const time = item.scanned_timestamp;

            if (!groups[location]) {
                groups[location] = {};
            }

            if (!groups[location][employee]) {
                groups[location][employee] = {
                    orderIds: new Set(),
                    firstTime: time,
                    lastTime: time,
                };
            }

            groups[location][employee].orderIds.add(orderId);

            if (new Date(time) < new Date(groups[location][employee].firstTime)) {
                groups[location][employee].firstTime = time;
            }

            if (new Date(time) > new Date(groups[location][employee].lastTime)) {
                groups[location][employee].lastTime = time;
            }
        });

        return groups;
    };

    // INITIAL LOAD
    useEffect(() => {
        fetch("http://localhost:5000/api/scan")
            .then((res) => res.json())
            .then((data) => {
                setRows(data.data);
                const grouped = calculateGroups(data.data);
                setGroupedData(grouped);
                setEmployeeScans(processEmployeeScans(data.data));
                console.log(data.data)

                // Auto-select first location
                const locations = Object.keys(grouped);
                if (locations.length > 0 && !selectedLocation) {
                    setSelectedLocation(locations[0]);
                }
            });
    }, []);

    // REALTIME UPDATES
    useEffect(() => {
        socket.on("new-data", (newRows) => {
            const updated = [...newRows, ...rows];
            setRows(updated);
            const newGroupedData = calculateGroups(updated);
            setGroupedData(newGroupedData);
            setEmployeeScans(processEmployeeScans(updated));

            // Find which locations were updated
            const updatedLocs = new Set();
            newRows.forEach(row => {
                const location = row.locations?.name || "Unknown Location";
                updatedLocs.add(location);
            });

            setUpdatedLocations(updatedLocs);

            // Remove animation after 2 seconds
            setTimeout(() => {
                setUpdatedLocations(new Set());
            }, 2000);
        });

        return () => socket.off("new-data");
    }, [rows]);

    // Calculate total statistics
    const totalStats = {
        locations: Object.keys(groupedData).length,
        employees: Object.values(groupedData).reduce((total, employees) => total + Object.keys(employees).length, 0),
        totalOrders: Object.values(groupedData).reduce((total, employees) => {
            return total + Object.values(employees).reduce((empTotal, info) => empTotal + info.orderIds.size, 0);
        }, 0)
    };

    // Get current location employees data
    const currentLocationEmployees = selectedLocation ? groupedData[selectedLocation] : {};
    const currentLocationScans = selectedLocation ? employeeScans[selectedLocation] : {};

    // Calculate grid columns based on employee count
    const employeeCount = Object.keys(currentLocationEmployees).length;
    const gridCols = employeeCount <= 2 ? 'grid-cols-1 md:grid-cols-2' :
        employeeCount <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';



    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100  overflow-hidden flex flex-col">


            {/* Location Navigation Tabs */}
            {Object.keys(groupedData).length > 0 && (
                <div className="flex-shrink-0 mb-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(groupedData).map((location) => (
                                <button
                                    key={location}
                                    onClick={() => setSelectedLocation(location)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${selectedLocation === location
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${updatedLocations.has(location) ? 'animate-pulse ring-2 ring-green-500' : ''
                                        }`}
                                >
                                    <FaMapMarkerAlt className="text-sm" />
                                    {location}
                                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                                        {Object.keys(groupedData[location] || {}).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
                {!selectedLocation ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <FaWarehouse className="text-6xl text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium">Select a location to view data</p>
                            <p className="text-gray-400 text-sm">Choose from the location tabs above</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {/* Selected Location Header */}
                        <div className="flex-shrink-0 mb-4">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <FaWarehouse className="text-2xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{selectedLocation}</h2>
                                            <p className="text-blue-100">
                                                {Object.keys(currentLocationEmployees).length} Employees • {" "}
                                                {Object.values(currentLocationEmployees).reduce((total, info) => total + info.orderIds.size, 0)} Total Orders
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-100 text-sm">Active Session</p>
                                        <p className="font-semibold">Real-time</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employees Grid */}
                        <div className={`flex-1 overflow-y-auto pb-4`}>
                            {/* <div className={`grid ${gridCols} gap-4`}> */}
                            <div className={`flex gap-1`}>
                                {Object.entries(currentLocationEmployees).map(([emp, info]) => (
                                    <div
                                        key={emp}
                                        className="bg-white rounded-xl  border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Employee Header */}
                                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 text-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/20 rounded-lg">
                                                        <FaUser className="text-lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{emp?.split(" / ")[0]}</h3>

                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                                        <FaClipboardList className="text-xs" />
                                                        {info.orderIds.size}
                                                    </div>
                                                    <p className="text-gray-300 text-xs mt-1">
                                                        {calculateDuration(info.firstTime, info.lastTime)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scanned Records */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaListOl className="text-blue-600 text-sm" />
                                                <h4 className="font-semibold text-gray-800">Scanned Records</h4>
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                    {currentLocationScans?.[emp]?.length || 0}
                                                </span>
                                            </div>

                                            <div className="space-y-2 ">
                                                {currentLocationScans?.[emp]?.map((scan, index) => (
                                                    <div
                                                        key={`${scan.orderId}-${index}`}
                                                        className="  border-b border-gray-200 hover:border-blue-300 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                                                    {index + 1}
                                                                </span>
                                                                <span className="font-mono text-sm font-semibold text-gray-800">
                                                                    {scan.orderId}
                                                                </span>
                                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-mono">
                                                                    {scan.styleNumber}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                                                {scan.scannedTime}
                                                            </span>
                                                        </div>

                                                    </div>
                                                ))}

                                                {(!currentLocationScans?.[emp] || currentLocationScans[emp].length === 0) && (
                                                    <div className="text-center py-4 text-gray-500">
                                                        <FaClipboardList className="text-2xl mx-auto mb-2 text-gray-400" />
                                                        <p>No scanned records found</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Status Footer */}
            {Object.keys(groupedData).length > 0 && (
                <div className="flex-shrink-0 mt-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-gray-700 font-medium text-sm">Live Data Streaming Active</span>
                                {selectedLocation && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        • Viewing: <strong>{selectedLocation}</strong>
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;