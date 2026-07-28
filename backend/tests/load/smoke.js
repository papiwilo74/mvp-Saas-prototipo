import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const failures = new Rate('failed_requests');
const menuTrend = new Trend('menu_duration');

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: {
    failed_requests: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api';

export default function () {
  const endpoints = [
    { name: 'menu', url: `${BASE_URL}/menu` },
    { name: 'health', url: `${BASE_URL}/health` },
  ];

  for (const ep of endpoints) {
    const res = http.get(ep.url);
    const ok = check(res, {
      [`${ep.name} status 200`]: (r) => r.status === 200,
    });
    failures.add(!ok);
    if (ep.name === 'menu') menuTrend.add(res.timings.duration);
  }

  sleep(1);
}
