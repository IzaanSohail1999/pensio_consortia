import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(404).json({ 
    message: 'Endpoint not found',
    error: 'This endpoint is not available in production'
  });
}
