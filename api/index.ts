import type { VercelRequest, VercelResponse } from '@vercel/node';

let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    try {
      const serverModule = await import('../backend/dist/server');
      appInstance = serverModule.default;
    } catch (error) {
      console.error('Failed to import server:', error);
      throw error;
    }
  }
  return appInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error: any) {
    console.error('Serverless function error:', error);
    console.error('Error stack:', error?.stack);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
}

