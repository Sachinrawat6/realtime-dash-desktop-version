import React, { useEffect, useState } from "react";
import {
    FaUser,
    FaMapMarkerAlt,
    FaListOl
} from "react-icons/fa";

function LocationEmployeeSelector({ groupedData, employeeScans }) {
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        // Auto-select first location
        const locations = Object.keys(groupedData);
        if (locations.length > 0 && !selectedLocation) {
            setSelectedLocation(locations[0]);
        }
    }, [groupedData]);

    useEffect(() => {
        // Update employees when location changes
        if (selectedLocation && groupedData[selectedLocation]) {
            const locationEmployees = Object.keys(groupedData[selectedLocation]);
            setEmployees(locationEmployees);
            if (locationEmployees.length > 0 && !selectedEmployee) {
                setSelectedEmployee(locationEmployees[0]);
            }
        } else {
            setEmployees([]);
            setSelectedEmployee("");
        }
    }, [selectedLocation, groupedData]);

    const currentEmployeeData = selectedLocation && selectedEmployee ?
        groupedData[selectedLocation]?.[selectedEmployee] : null;
    const currentEmployeeScans = selectedLocation && selectedEmployee ?
        employeeScans[selectedLocation]?.[selectedEmployee] : [];

    // Get unique scans by orderId
    const uniqueScans = currentEmployeeScans.filter((scan, index, self) =>
        index === self.findIndex(s => s.orderId === scan.orderId)
    );

    return (
        <div className="h-full bg-white p-6 overflow-auto">
            <div className="container mx-auto">

                {/* Dropdown Selectors */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Location Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-blue-500" />
                                Select Location
                            </label>
                            <select
                                value={selectedLocation}
                                onChange={(e) => {
                                    setSelectedLocation(e.target.value);
                                    setSelectedEmployee("")
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Choose a location</option>
                                {Object.keys(groupedData).map((location) => (
                                    <option key={location} value={location}>
                                        {location} ({Object.keys(groupedData[location] || {}).length} employees)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Employee Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaUser className="text-green-500" />
                                Select Employee
                            </label>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={!selectedLocation}
                            >
                                <option value="">Choose an employee</option>
                                {employees.map((employee) => (
                                    <option key={employee} value={employee}>
                                        {employee}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Selected Employee Data */}
                {currentEmployeeData && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="border-b border-gray-200 p-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaListOl className="text-blue-600" />
                                Recent Scans ({uniqueScans.length})
                            </h3>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Style Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Scan Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {uniqueScans?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))?.map((scan, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono font-semibold text-gray-900">
                                                    {scan.orderId}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {scan.styleNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {scan.scannedTime}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {uniqueScans.length === 0 && (
                            <div className="text-center py-12">
                                <FaListOl className="text-4xl text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No scan records found</p>
                            </div>
                        )}
                    </div>
                )}

                {!currentEmployeeData && selectedLocation && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Please select an employee to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LocationEmployeeSelector;