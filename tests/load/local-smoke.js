import http from 'k6/http';
import { check, sleep } from 'k6';

const WEB_URL = (__ENV.WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_URL = (__ENV.API_URL || 'http://localhost:4000').replace(/\/$/, '');

const WEB_PAGES = [
  { path: '/en', name: 'home' },
  { path: '/en/schedule', name: 'schedule' },
  { path: '/en/package', name: 'package' },
  { path: '/en/coaches', name: 'coaches' },
  { path: '/en/contact', name: 'contact' },
  { path: '/en/story', name: 'story' },
  { path: '/en/privacy', name: 'privacy' },
  { path: '/en/terms', name: 'terms' },
  { path: '/en/refund', name: 'refund' },
  { path: '/en/explore', name: 'explore' },
];

const API_ENDPOINTS = [
  { path: '/v1/health', name: 'health' },
  { path: '/v1/coaches', name: 'coaches' },
  { path: '/v1/packages/plans', name: 'packages-plans' },
  { path: '/v1/studio', name: 'studio' },
  { path: '/v1/studio/home-sections', name: 'studio-home-sections' },
  {
    path: '/v1/schedule/public?from=2026-07-07&to=2026-07-14',
    name: 'schedule-public',
  },
  {
    path: '/v1/classes/sessions?from=2026-07-07',
    name: 'classes-sessions-clamped',
  },
  { path: '/v1/classes/types', name: 'classes-types' },
];

export const options = {
  stages: [
    { duration: '30s', target: 2 },
    { duration: '60s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
    'http_req_duration{type:api}': ['p(95)<1000'],
    'http_req_duration{type:web}': ['p(95)<1500'],
  },
};

function requestGet(url, tags) {
  return http.get(url, {
    tags,
    timeout: '30s',
  });
}

export default function smokeIteration() {
  const webPage = WEB_PAGES[Math.floor(Math.random() * WEB_PAGES.length)];
  const webRes = requestGet(`${WEB_URL}${webPage.path}`, {
    type: 'web',
    page: webPage.name,
  });
  check(webRes, {
    [`web ${webPage.name} status 2xx`]: (r) => r.status >= 200 && r.status < 300,
  });

  const apiEndpoint =
    API_ENDPOINTS[Math.floor(Math.random() * API_ENDPOINTS.length)];
  const apiRes = requestGet(`${API_URL}${apiEndpoint.path}`, {
    type: 'api',
    endpoint: apiEndpoint.name,
  });
  check(apiRes, {
    [`api ${apiEndpoint.name} status 2xx`]: (r) => r.status >= 200 && r.status < 300,
  });

  if (apiEndpoint.name === 'coaches') {
    check(apiRes, {
      'coaches response has no user.email leak': (r) => {
        if (r.status < 200 || r.status >= 300) {
          return true;
        }
        try {
          const body = r.json();
          if (!Array.isArray(body)) {
            return true;
          }
          return body.every(
            (coach) =>
              coach.user === undefined ||
              coach.user === null ||
              coach.user.email === undefined,
          );
        } catch {
          return false;
        }
      },
    });
  }

  if (apiEndpoint.name === 'health') {
    check(apiRes, {
      'health reports database ok': (r) => {
        if (r.status !== 200) {
          return false;
        }
        try {
          const body = r.json();
          return body.status === 'ok' && body.database === 'ok';
        } catch {
          return false;
        }
      },
    });
  }

  sleep(Math.random() * 0.5 + 0.25);
}

export function handleSummary(data) {
  const lines = [
    '',
    '=== Ommm local smoke summary ===',
    `WEB_URL=${WEB_URL}`,
    `API_URL=${API_URL}`,
    `http_req_failed: ${data.metrics.http_req_failed?.values.rate ?? 'n/a'}`,
    `http_req_duration p50: ${data.metrics.http_req_duration?.values['p(50)'] ?? 'n/a'} ms`,
    `http_req_duration p90: ${data.metrics.http_req_duration?.values['p(90)'] ?? 'n/a'} ms`,
    `http_req_duration p95: ${data.metrics.http_req_duration?.values['p(95)'] ?? 'n/a'} ms`,
    `http_req_duration p99: ${data.metrics.http_req_duration?.values['p(99)'] ?? 'n/a'} ms`,
    `checks passed: ${data.metrics.checks?.values.passes ?? 0}`,
    `checks failed: ${data.metrics.checks?.values.fails ?? 0}`,
    '',
  ];
  return {
    stdout: lines.join('\n'),
  };
}
