import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import TailorCuttingStats from './TailorCuttingStats';
import LocationEmployeeSelector from './LocationEmployeeSelector';
import TopEmployeesStats from './TopEmployeeStats';

import Navbar from './Navbar';
import ProductPage from './ProductPage';
import PicklistDashboardPage from '../pages/PicklistDashboardPage';
import { fetchLiningDataFromGoogleSheet } from '../services/googleSheetService';

function Dashboard() {
  const [rows, setRows] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [employeeScans, setEmployeeScans] = useState({});
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [styleDetails, setStyleDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleSheetData, setGoogleSheetData] = useState([]);

  // Process scan data function
  const processEmployeeScans = (data) => {
    const scans = {};
    data.forEach((item) => {
      const location = item.locations?.name || 'Unknown Location';
      const employee = item.employees?.user_name || 'Unknown Employee';
      const orderId = item.order_id;
      const styleNumber = item?.orders_2?.style_number || 'N/A';
      const timestamp = item.scanned_timestamp;

      if (!scans[location]) scans[location] = {};
      if (!scans[location][employee]) scans[location][employee] = [];

      scans[location][employee].push({
        orderId,
        styleNumber,
        timestamp,
        scannedTime: new Date(timestamp).toLocaleTimeString(),
      });
    });

    Object.keys(scans).forEach((location) => {
      Object.keys(scans[location]).forEach((employee) => {
        scans[location][employee].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    });

    return scans;
  };

  // load google sheet data
  const fetchGoogleSheetData = async () => {
    setLoading(true);
    try {
      const response = await fetchLiningDataFromGoogleSheet();
      setGoogleSheetData(response);
    } catch (error) {
      console.error('Failed to fetch googlesheet data error :: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSheetData();
  }, []);

  // get lining and without lining status
  const getLiningStatus = (style_number) => {
    if (!style_number) return 0;

    if (googleSheetData && googleSheetData.length > 0) {
      const matchingData = googleSheetData.find(
        (g) => Number(g.style_number) === Number(style_number)
      );
      if (matchingData) {
        const liningValue = matchingData.lining?.toLowerCase()?.trim();
        return liningValue === 'with' ? 1 : 0;
      }
    }
    return 0; // Return 0 if no data found
  };

  // Group data function
  const calculateGroups = (data) => {
    const groups = {};
    data.forEach((item) => {
      const location = item.locations?.name?.split(' / ')[0] || 'Unknown Location';
      const employee = item.employees?.user_name || 'Unknown Employee';
      const orderId = item.order_id;
      const time = item.scanned_timestamp;
      const style_number = item.orders_2?.style_number;

      const liningStatus = getLiningStatus(style_number);

      if (!groups[location]) groups[location] = {};
      if (!groups[location][employee]) {
        groups[location][employee] = {
          orderIds: new Set(),
          firstTime: time,
          lastTime: time,
          style_number,
          liningCount: 0,
          totalOrders: 0,
        };
      }

      groups[location][employee].orderIds.add(orderId);
      groups[location][employee].totalOrders = groups[location][employee].orderIds.size;

      // Update lining count if location is "Cutting Master" and lining status is "With" (1)
      if (location.toLowerCase() === 'cutting master' && liningStatus === 1) {
        groups[location][employee].liningCount += 1;
      }

      if (new Date(time) < new Date(groups[location][employee].firstTime)) {
        groups[location][employee].firstTime = time;
      }
      if (new Date(time) > new Date(groups[location][employee].lastTime)) {
        groups[location][employee].lastTime = time;
      }
    });
    return groups;
  };

  // Track recent updates
  const trackUpdates = (newRows) => {
    const updates = [];
    newRows.forEach((row) => {
      const location = row.locations?.name || 'Unknown Location';
      const employee = row.employees?.user_name || 'Unknown Employee';
      if (
        location.toLowerCase().includes('tailor scan 2') ||
        location.toLowerCase().includes('cutting') ||
        location.toLowerCase().includes('master') ||
        location.toLowerCase().includes('kharcha') ||
        location.toLowerCase().includes('admin')
        // for testing
        // location.toLowerCase().includes('admin')
      ) {
        updates.push({ location, employee, timestamp: new Date() });
      }
    });
    return updates;
  };

  // INITIAL LOAD
  useEffect(() => {
    fetch('https://realtime-backend-673j.onrender.com/api/scan')
      // fetch("http://localhost:5000/api/scan")

      .then((res) => res.json())
      .then((data) => {
        setRows(data.data);
        setGroupedData(calculateGroups(data.data));
        setEmployeeScans(processEmployeeScans(data.data));
      });
  }, []);

  // REALTIME UPDATES
  useEffect(() => {
    const handleNewData = (newRows) => {
      console.log('New data received:', newRows);
      // set style details
      setStyleDetails(newRows);
      // Track which employees are being updated
      const newUpdates = trackUpdates(newRows);
      if (newUpdates.length > 0) {
        setRecentUpdates(newUpdates);

        // Clear updates after 2 seconds
        setTimeout(() => {
          setRecentUpdates((prev) =>
            prev.filter((update) => new Date() - new Date(update.timestamp) < 2000)
          );
        }, 2000);
      }

      // Update main data
      const updated = [...newRows, ...rows];
      setRows(updated);
      setGroupedData(calculateGroups(updated));
      setEmployeeScans(processEmployeeScans(updated));
    };

    socket.on('new-data', handleNewData);
    return () => socket.off('new-data', handleNewData);
  }, [rows]);

  // Process data when both sources are available
  useEffect(() => {
    if (rows.length > 0 && googleSheetData.length > 0) {
      console.log('Both data sources loaded, calculating groups...');
      setGroupedData(calculateGroups(rows));
      setEmployeeScans(processEmployeeScans(rows));
    }
  }, [rows, googleSheetData]);

  if (loading) {
    return <p className="mt-4 ">loading googlesheet data...</p>;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 0:
        return (
          <TailorCuttingStats
            groupedData={groupedData}
            employeeScans={employeeScans}
            recentUpdates={recentUpdates}
            productDetails={styleDetails}
          />
        );
      case 1:
        return <LocationEmployeeSelector groupedData={groupedData} employeeScans={employeeScans} />;
      case 2:
        return <TopEmployeesStats groupedData={groupedData} />;
      case 3:
        return <PicklistDashboardPage />;
      default:
        return (
          <TailorCuttingStats
            groupedData={groupedData}
            employeeScans={employeeScans}
            recentUpdates={recentUpdates}
            productDetails={styleDetails}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-gray-900 overflow-hidden flex flex-col">
      {/* Navigation Bar */}
      {/* <Navbar activeTab={activeTab} setActiveTab={setActiveTab} /> */}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{renderActiveComponent()}</div>
    </div>
  );
}

export default Dashboard;
