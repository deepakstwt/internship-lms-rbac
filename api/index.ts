import type { VercelRequest, VercelResponse } from '@vercel/node';

let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    const serverModule = await import('../backend/src/server');
    appInstance = serverModule.default;
  }
  return appInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

