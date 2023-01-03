import express, { Request, Response } from 'express';
import { catchExpressJsErrorWrapper } from '../../utils';
import * as db from 'core/db';
import { getLineDetailsResponse } from './dto';

export const getLineDetails = async (req: Request, res: Response) => {
  const line = await db.getLineDetails(req.params.id);
  if (!line) {
    throw new Error('NotFound: Line not found');
  }
  res.json(getLineDetailsResponse(line));
};

export const lineApi = express.Router();
lineApi.get('/:id/details', catchExpressJsErrorWrapper(getLineDetails));
