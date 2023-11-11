import axios from 'axios';
import { logger } from 'core/utils/logger';

interface ProcessImagePayload {
  input: {
    s3: {
      bucket?: string;
      key: string;
    };
  };
  output: {
    s3: {
      bucket: string;
      key: string;
    };
  };
  outputFormat: 'jpeg' | 'png' | 'webp';
  resize: {
    width: number;
    height: number;
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  quality: number;
  cacheControl?: string;
}
const api = axios.create({
  baseURL: `https://k6wagh946a.execute-api.eu-central-1.amazonaws.com/prod/image-processor`,
  headers: {
    'x-api-key': process.env.ISA_DOCUMENTS_IMAGE_PROCESSING_API_KEY,
  },
});

const processImage = async (payload: ProcessImagePayload) => {
  return api
    .post(`/process`, payload)
    .then(() => true)
    .catch((err) => {
      logger.error('Error while processing image', { message: err.message });
      return false;
    });
};

export const isaDocumentApi = {
  processImage,
};
