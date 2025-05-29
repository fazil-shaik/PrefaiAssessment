import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getEvaluationHistory } from '../services/api';

interface EvaluationHistory {
  _id: string;
  timestamp: string;
  successRate: number;
  totalEndpoints: number;
  successfulEndpoints: number;
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<EvaluationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getEvaluationHistory();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-64">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" className="mt-4">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Evaluation History
      </Typography>

      {history.length === 0 ? (
        <Paper className="p-6 text-center">
          <Typography>No evaluation history found.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Success Rate</TableCell>
                <TableCell align="right">Total Endpoints</TableCell>
                <TableCell align="right">Successful Endpoints</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((evaluation) => (
                <TableRow key={evaluation._id}>
                  <TableCell>
                    {new Date(evaluation.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    {evaluation.successRate.toFixed(1)}%
                  </TableCell>
                  <TableCell align="right">{evaluation.totalEndpoints}</TableCell>
                  <TableCell align="right">
                    {evaluation.successfulEndpoints}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/evaluation/${evaluation._id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default History; 