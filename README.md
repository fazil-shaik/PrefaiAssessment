# REST API Evaluator

A powerful tool for evaluating and testing REST APIs using OpenAPI Specifications (OAS).

## Features

- Parse and analyze OpenAPI Specification files
- Automatically test GET and POST endpoints
- Generate intelligent dummy data based on schema definitions
- Detailed request/response logging
- Success rate analysis and reporting
- Beautiful and intuitive user interface
- Support for authenticated endpoints
- Configurable testing parameters

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Testing**: Jest
- **Styling**: Tailwind CSS
- **API Testing**: Axios

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rest-api-evaluator
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# In server directory
cp .env.example .env
```

4. Configure the environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/api-evaluator
NODE_ENV=development
```

## Running the Application

1. Start the MongoDB service:
```bash
mongod
```

2. Start the backend server:
```bash
cd server
npm run dev
```

3. Start the frontend development server:
```bash
cd client
npm start
```

4. Access the application at `http://localhost:3000`

## Usage

1. Navigate to the application in your browser
2. Input an OpenAPI Specification URL or paste the JSON content
3. Click "Evaluate API" to start the analysis
4. View the detailed logs and summary report
5. Export results if needed

## Project Structure

```
rest-api-evaluator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend tests
└── README.md
```

## Assumptions

1. The OpenAPI Specification is valid and follows the OpenAPI 3.0 standard
2. For POST requests without schema definitions, reasonable default values will be generated
3. Timeout for API requests is set to 30 seconds by default
4. Maximum retry attempts for failed requests is set to 3
5. The application assumes JSON as the default content type for requests/responses

## Testing

Run the test suite:
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 