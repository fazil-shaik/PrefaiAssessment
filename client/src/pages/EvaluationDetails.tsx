import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  Box,
  Chip,
  Grid,
} from '@mui/material';
import { getEvaluationResult, EvaluationResult } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const EvaluationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const data = await getEvaluationResult(id!);
        setEvaluation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch evaluation details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [id]);

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

  if (!evaluation) {
    return (
      <Container>
        <Alert severity="warning" className="mt-4">
          Evaluation not found
        </Alert>
      </Container>
    );
  }

  // Prepare data for charts
  const successCount = evaluation.successfulEndpoints;
  const failureCount = evaluation.totalEndpoints - successCount;

  const pieChartData = {
    labels: ['Success', 'Failure'],
    datasets: [
      {
        data: [successCount, failureCount],
        backgroundColor: ['#4caf50', '#f44336'],
        borderColor: ['#388e3c', '#d32f2f'],
        borderWidth: 1,
      },
    ],
  };

  // Group endpoints by method
  const methodStats = evaluation.results.reduce((acc: any, result: EvaluationResult) => {
    const method = result.method;
    if (!acc[method]) {
      acc[method] = { success: 0, failure: 0 };
    }
    if (result.success) {
      acc[method].success++;
    } else {
      acc[method].failure++;
    }
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(methodStats),
    datasets: [
      {
        label: 'Success',
        data: Object.values(methodStats).map((stat: any) => stat.success),
        backgroundColor: '#4caf50',
      },
      {
        label: 'Failure',
        data: Object.values(methodStats).map((stat: any) => stat.failure),
        backgroundColor: '#f44336',
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Endpoint Status by Method',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Endpoints',
        },
      },
    },
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Evaluation Details
      </Typography>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Success Rate Distribution
            </Typography>
            <Box className="h-64 flex items-center justify-center">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Endpoint Status by Method
            </Typography>
            <Box className="h-64">
              <Bar data={barChartData} options={barChartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box className="mb-6">
        <Paper className="p-4">
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Box className="grid grid-cols-3 gap-4">
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Success Rate
              </Typography>
              <Typography variant="h4">
                {evaluation.successRate.toFixed(1)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Endpoints
              </Typography>
              <Typography variant="h4">{evaluation.totalEndpoints}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Successful Endpoints
              </Typography>
              <Typography variant="h4">
                {evaluation.successfulEndpoints}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Typography variant="h5" gutterBottom>
        Endpoint Results
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Endpoint</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evaluation.results.map((result: EvaluationResult, index: number) => (
              <TableRow key={index}>
                <TableCell>{result.path}</TableCell>
                <TableCell>{result.method}</TableCell>
                <TableCell>
                  <Chip
                    label={result.success ? 'Success' : 'Failed'}
                    color={result.success ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box className="max-w-md overflow-x-auto">
                    <pre className="text-sm">
                      {JSON.stringify(
                        result.response?.data || result.error,
                        null,
                        2
                      )}
                    </pre>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default EvaluationDetails; 