import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders REST API Evaluator title', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const titleElement = screen.getByText(/REST API Evaluator/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders OpenAPI Specification URL input', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const urlInput = screen.getByPlaceholderText(/https:\/\/petstore\.swagger\.io\/v2\/swagger\.json/i);
  expect(urlInput).toBeInTheDocument();
});

test('renders OpenAPI Specification JSON textarea', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const jsonTextarea = screen.getByPlaceholderText(/Paste your OpenAPI specification JSON here/i);
  expect(jsonTextarea).toBeInTheDocument();
});
