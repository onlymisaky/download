import axios, { AxiosRequestConfig } from 'axios';
import { defaultHeaders, formatHeaders } from './headers';

export function preRequest(url: string, requestConfig: AxiosRequestConfig = {}) {
  const { headers, ...otherConfig } = requestConfig;
  return axios({
    method: 'head',
    url,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...otherConfig,
  }).then((res) => {
    return formatHeaders(res.headers);
  });
}
