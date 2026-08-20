import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE;

export const fetchRecords = async () => {
    const res = await axios.get(`${API_BASE}/scan`); // placeholder; change to your GET records endpoint if implemented
    // This repo includes the /api/scan route that triggers external scan; adapt as needed.
    return res.data || [];
};
