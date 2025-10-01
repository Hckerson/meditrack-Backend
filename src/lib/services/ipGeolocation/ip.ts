import 'dotenv/config';
import axios from 'axios';
const ENDPOINT = 'https://api.ipgeolocation.io/v2/ipgeo';
const API_KEY = process.env.IP_API_KEY || '';

export async function fetchLocation(ipAddress: string) {
  const params = new URLSearchParams();
  params.append('apiKey', API_KEY);
  params.append('ip', ipAddress);
  const url = `${ENDPOINT}?${params.toString()}`;
  try {
    const response = await axios.get(url);
    return { success: true, message: 'fetch successful', data: response.data };
  } catch (error) {
    console.error(`Error querying ip: ${error}`);
    throw error;
  }
}
