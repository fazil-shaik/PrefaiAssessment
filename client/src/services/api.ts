import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface EvaluationResult {
  path: string;
  method: string;
  requestData: any;
  response: {
    status: number;
    data: any;
    headers: any;
  };
  error?: string;
  success: boolean;
}

export interface EvaluationSummary {
  successRate: number;
  totalEndpoints: number;
  successfulEndpoints: number;
}

export interface EvaluationResponse {
  evaluationId: string;
  results: EvaluationResult[];
  summary: EvaluationSummary;
}

export const evaluateApi = async (url: string | null, spec: any | null): Promise<EvaluationResponse> => {
  const body: any = {};
  if (url) body.url = url;
  if (spec) body.spec = spec;
  const response = await axios.post(`${API_URL}/evaluate`, body);
  return response.data.data;
};

export const getEvaluationHistory = async () => {
  const response = await axios.get(`${API_URL}/history`);
  return response.data.data;
};

export const getEvaluationResult = async (id: string) => {
  const response = await axios.get(`${API_URL}/evaluation/${id}`);
  return response.data.data;
}; 