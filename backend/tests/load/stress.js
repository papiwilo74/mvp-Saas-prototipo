import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const failures = new Rate('failed_requests');

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '2m', target: 40 },
    { duration: '2m', target: 60 },
    { duration: '2m', target: 80 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    failed_requests: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api';

const ENDPOINTS = [
  { method: 'GET', url: '/menu' },
  { method: 'GET', url: '/health' },
];

export default function () {
  const ep = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  const res = ep.method === 'GET'
    ? http.get(`${BASE_URL}${ep.url}`)
    : http.post(`${BASE_URL}${ep.url}`, '{}', { headers: { 'Content-Type': 'application/json' } });

  const ok = check(res, { [`${ep.url} status 2xx`]: (r) => r.status >= 200 && r.status < 300 });
  failures.add(!ok);
  sleep(0.5 + Math.random());
}
