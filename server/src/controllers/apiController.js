const axios = require('axios');
const SwaggerParser = require('swagger-parser');
const { generateDummyData } = require('../utils/dataGenerator');
const Evaluation = require('../models/Evaluation');

const evaluateApi = async (req, res, next) => {
  try {
    console.log('Starting API evaluation...');
    const { url, spec } = req.body;

    // Validate input
    if (!url && !spec) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Either URL or specification object must be provided'
        }
      });
    }

    let apiSpec;
    // Parse the OpenAPI specification
    try {
      if (url) {
        console.log(`Parsing API spec from URL: ${url}`);
        // Validate URL is accessible
        try {
          await axios.head(url, { timeout: 5000 });
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'URL is not accessible',
              details: error.message
            }
          });
        }
        apiSpec = await SwaggerParser.parse(url);
      } else if (spec) {
        console.log('Parsing API spec from provided object');
        apiSpec = await SwaggerParser.parse(spec);
      }

      if (!apiSpec.servers && apiSpec.host && apiSpec.basePath && apiSpec.schemes) {
        // Use the first scheme (usually https)
        apiSpec.servers = [
          { url: `${apiSpec.schemes[0]}://${apiSpec.host}${apiSpec.basePath}` }
        ];
      }
    } catch (parseError) {
      console.error('Error parsing API spec:', parseError);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid API specification',
          details: parseError.message
        }
      });
    }

    // Validate OpenAPI spec structure
    if (!apiSpec || typeof apiSpec !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid API specification format'
        }
      });
    }

    if (!apiSpec.servers || !apiSpec.servers[0] || !apiSpec.servers[0].url) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'API specification must include at least one server URL'
        }
      });
    }

    const results = [];
    const paths = apiSpec.paths || {};

    if (Object.keys(paths).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'API specification must include at least one path'
        }
      });
    }

    console.log(`Found ${Object.keys(paths).length} paths to evaluate`);

    // Process each endpoint
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (method.toLowerCase() === 'get' || method.toLowerCase() === 'post') {
          try {
            const fullUrl = `${apiSpec.servers[0].url}${path}`;
            console.log(`Testing ${method.toUpperCase()} ${fullUrl}`);
            
            const requestData = method.toLowerCase() === 'post' 
              ? generateDummyData(details.requestBody?.content?.['application/json']?.schema)
              : null;

            const response = await axios({
              method: method.toLowerCase(),
              url: fullUrl,
              data: requestData,
              timeout: 30000,
              validateStatus: () => true, // Accept all status codes
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            results.push({
              path,
              method: method.toUpperCase(),
              requestData,
              response: {
                status: response.status,
                data: response.data,
                headers: response.headers
              },
              success: response.status >= 200 && response.status < 300
            });
            
            console.log(`Test completed for ${method.toUpperCase()} ${path} - Status: ${response.status}`);
          } catch (error) {
            console.error(`Error testing ${method.toUpperCase()} ${path}:`, error.message);
            results.push({
              path,
              method: method.toUpperCase(),
              error: error.message,
              success: false
            });
          }
        }
      }
    }

    // Calculate success rate
    const successCount = results.filter(r => r.success).length;
    const successRate = results.length > 0 ? (successCount / results.length) * 100 : 0;

    console.log(`Evaluation complete. Success rate: ${successRate}%`);

    // Save evaluation results
    const evaluation = new Evaluation({
      timestamp: new Date(),
      results,
      successRate,
      totalEndpoints: results.length,
      successfulEndpoints: successCount
    });

    await evaluation.save();

    res.json({
      success: true,
      data: {
        evaluationId: evaluation._id,
        results,
        summary: {
          successRate,
          totalEndpoints: results.length,
          successfulEndpoints: successCount
        }
      }
    });
  } catch (error) {
    console.error('Unexpected error during API evaluation:', error);
    next(error);
  }
};

const getEvaluationHistory = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select('timestamp successRate totalEndpoints successfulEndpoints');

    res.json({
      success: true,
      data: evaluations
    });
  } catch (error) {
    next(error);
  }
};

const getEvaluationResult = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  evaluateApi,
  getEvaluationHistory,
  getEvaluationResult
}; 