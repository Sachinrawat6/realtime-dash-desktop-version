import axios from 'axios';
import { GOOGLE_SHEET_API_KEY, GOOGLE_SHEET_ID, GOOGLE_SHEET_RANGE } from '../constants/index.js';

export const fetchLiningDataFromGoogleSheet = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${GOOGLE_SHEET_RANGE}?key=${GOOGLE_SHEET_API_KEY}`;
  const response = await axios.get(url);
  const data = response.data?.values || [];

  // Skip the header row (index 0) and convert to objects
  const liningData = data
    .slice(1)
    .map((row) => ({
      style_number: parseInt(row[0], 10),
      lining: row[1],
    }))
    .filter(
      (item) =>
        !isNaN(item.style_number) && item.style_number !== null && item.style_number !== undefined
    );

  return liningData;
};
