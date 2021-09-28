import axios, { AxiosRequestConfig } from 'axios';
import { defaultHeaders, formatHeaders } from './headers';

export function preRequest(url: string, requestConfig: AxiosRequestConfig = {}) {
  const { headers, ...otherConfig } = requestConfig;
  return axios({
    method: 'get',
    url,
    headers: {
      ...defaultHeaders,
      ...headers,
      'Range': 'bytes=0-1'
    },
    ...otherConfig,
  }).then((res) => {
    return formatHeaders(res.headers);
  });
}
