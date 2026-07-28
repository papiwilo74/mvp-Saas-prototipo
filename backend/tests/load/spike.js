import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const failures = new Rate('failed_requests');

export const options = {
  stages: [
    { duration: '10s', target: 0 },
    { duration: '5s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    failed_requests: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api';

export default function () {
  const res = http.get(`${BASE_URL}/menu`);
  check(res, { 'menu status 200': (r) => r.status === 200 });
  failures.add(res.status !== 200);
  sleep(0.5);
}
