import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = new URL(req.url);
  const backendUrl = `${BACKEND_URL}/api/${path.join('/')}${url.search}`;

  // Build forwarded headers — auth_token is on the frontend domain and
  // carries the Better Auth session token for Bearer verification on the backend.
  const headers = new Headers();

  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  // Prefer the Authorization header sent by the client (api.ts includes it).
  // Fall back to the auth_token cookie set by SessionSync for requests that
  // bypass api.ts (e.g. direct fetch calls without explicit token).
  const incomingAuth = req.headers.get('authorization');
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (incomingAuth) {
    headers.set('authorization', incomingAuth);
  } else if (cookieToken) {
    headers.set('authorization', `Bearer ${cookieToken}`);
  }

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  const upstream = await fetch(backendUrl, {
    method: req.method,
    headers,
    body,
  });

  const responseBody = await upstream.text();

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
