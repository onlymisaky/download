import axios from 'axios';
import { formatHeaders } from './headers';

async function preRequest(url: string) {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Pragma': 'no-cache',
        'Range': 'bytes=0-1'
      }
    });

    return formatHeaders(res.headers);
  } catch (err) {
    throw err;
  }
}

export default preRequest;
