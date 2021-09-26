import axios from 'axios';
import { defaultHeaders, formatHeaders } from './headers';

async function preRequest(url: string) {
  try {
    const res = await axios({
      method: 'get',
      url,
      headers: {
        ...defaultHeaders,
        'Range': 'bytes=0-1'
      }
    });
    return formatHeaders(res.headers);
  } catch (err) {
    throw err;
  }
}

export default preRequest;
