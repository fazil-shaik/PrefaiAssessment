import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { evaluateApi } from '../services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [spec, setSpec] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.trim());
      return url.trim().startsWith('http://') || url.trim().startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedUrl = url.trim();
    const trimmedSpec = spec.trim();

    if (!trimmedUrl && !trimmedSpec) {
      setError('Please provide either a URL or OpenAPI specification JSON');
      setLoading(false);
      return;
    }

    if (trimmedUrl && !validateUrl(trimmedUrl)) {
      setError('Please provide a valid HTTP/HTTPS URL');
      setLoading(false);
      return;
    }

    try {
      let specData = null;
      if (trimmedSpec) {
        try {
          specData = JSON.parse(trimmedSpec);
        } catch (e) {
          throw new Error('Invalid JSON specification');
        }
      }

      const result = await evaluateApi(trimmedUrl || null, specData);
      navigate(`/evaluation/${result.evaluationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper className="p-6">
        <Typography variant="h4" component="h1" gutterBottom>
          REST API Evaluator
        </Typography>
        <Typography variant="body1" paragraph>
          Enter an OpenAPI Specification URL or paste the JSON content to evaluate the API endpoints.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box className="space-y-4">
            <TextField
              fullWidth
              label="OpenAPI Specification URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://petstore.swagger.io/v2/swagger.json"
              disabled={loading}
              error={url !== '' && !validateUrl(url)}
              helperText={url !== '' && !validateUrl(url) ? 'Please enter a valid HTTP/HTTPS URL' : ''}
            />

            <Typography variant="subtitle1" className="text-center">
              OR
            </Typography>

            <TextField
              fullWidth
              label="OpenAPI Specification JSON"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              multiline
              rows={10}
              disabled={loading}
              placeholder="Paste your OpenAPI specification JSON here..."
              error={spec !== '' && !isValidJson(spec)}
              helperText={spec !== '' && !isValidJson(spec) ? 'Please enter valid JSON' : ''}
            />

            {error && (
              <Alert severity="error" className="mt-4">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || (!url && !spec) || (url !== '' && !validateUrl(url)) || (spec !== '' && !isValidJson(spec))}
              className="mt-4"
            >
              {loading ? (
                <>
                  <CircularProgress size={24} className="mr-2" />
                  Evaluating...
                </>
              ) : (
                'Evaluate API'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

const isValidJson = (str: string): boolean => {
  if (!str.trim()) return true;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export default Home; 