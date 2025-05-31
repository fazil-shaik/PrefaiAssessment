const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generatePatternValue = (pattern) => {
  if (pattern.includes('[0-9]') || pattern.includes('\\d')) {
    return '12345';
  }
  if (pattern.includes('[a-z]')) {
    return 'abcde';
  }
  if (pattern.includes('[A-Z]')) {
    return 'ABCDE';
  }
  if (pattern.includes('[a-zA-Z]')) {
    return 'Example';
  }
  return 'pattern-match';
};

const generateStringValue = (schema) => {
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }
  
  if (schema.example) {
    return schema.example;
  }
  
  if (schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.format) {
    case 'email':
      return 'user@example.com';
    case 'date':
      return new Date().toISOString().split('T')[0];
    case 'date-time':
      return new Date().toISOString();
    case 'uuid':
      return generateUUID();
    case 'uri':
    case 'url':
      return 'https://example.com';
    case 'hostname':
      return 'example.com';
    case 'ipv4':
      return '192.168.1.1';
    case 'ipv6':
      return '2001:db8::1';
    case 'password':
      return 'secretPassword123';
    case 'byte':
      return Buffer.from('example').toString('base64');
    case 'binary':
      return 'binary-data';
    default:
      break;
  }

  if (schema.pattern) {
    return generatePatternValue(schema.pattern);
  }

  const minLength = schema.minLength || 1;
  const maxLength = Math.min(schema.maxLength || 50, 100);
  const length = Math.max(minLength, Math.min(maxLength, 10));
  
  return 'example'.repeat(Math.ceil(length / 7)).substring(0, length);
};

const generateNumberValue = (schema) => {
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }
  
  if (schema.example !== undefined) {
    return schema.example;
  }
  
  if (schema.default !== undefined) {
    return schema.default;
  }

  const minimum = schema.minimum || (schema.exclusiveMinimum ? schema.exclusiveMinimum + 1 : 0);
  const maximum = schema.maximum || (schema.exclusiveMaximum ? schema.exclusiveMaximum - 1 : 100);
  
  const value = minimum + Math.random() * (maximum - minimum);
  
  if (schema.multipleOf) {
    return Math.round(value / schema.multipleOf) * schema.multipleOf;
  }
  
  return schema.type === 'integer' ? Math.round(value) : Math.round(value * 100) / 100;
};

const generateObjectValue = (schema, definitions, components) => {
  const obj = {};
  
  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      const isRequired = schema.required?.includes(key);
      const includeOptional = Math.random() > 0.3;
      
      if (isRequired || includeOptional) {
        obj[key] = generateDummyData(propSchema, definitions, components);
      }
    });
  }
  
  if (schema.additionalProperties === true) {
    obj.additionalProperty = 'additional-value';
  } else if (typeof schema.additionalProperties === 'object') {
    obj.additionalProperty = generateDummyData(schema.additionalProperties, definitions, components);
  }
  
  return obj;
};

const generateDummyData = (schema, definitions, components) => {
  if (!schema) return null;

  if (schema.$ref) {
    let refPath = schema.$ref;
    let refData = null;
    
    if (refPath.startsWith('#/definitions/')) {
      const defName = refPath.replace('#/definitions/', '');
      refData = definitions?.[defName];
    } else if (refPath.startsWith('#/components/schemas/')) {
      const schemaName = refPath.replace('#/components/schemas/', '');
      refData = components?.schemas?.[schemaName];
    } else if (refPath.startsWith('#/')) {
      const pathParts = refPath.substring(2).split('/');
      let current = { definitions, components };
      for (const part of pathParts) {
        current = current?.[part];
      }
      refData = current;
    }
    
    if (refData) {
      return generateDummyData(refData, definitions, components);
    }
    return null;
  }

  if (schema.allOf) {
    const merged = {};
    schema.allOf.forEach((subSchema) => {
      const subData = generateDummyData(subSchema, definitions, components);
      Object.assign(merged, subData);
    });
    return merged;
  }

  if (schema.oneOf || schema.anyOf) {
    const options = schema.oneOf || schema.anyOf;
    if (options.length > 0) {
      return generateDummyData(options[0], definitions, components);
    }
  }

  switch (schema.type) {
    case 'string':
      return generateStringValue(schema);
    case 'integer':
    case 'number':
      return generateNumberValue(schema);
    case 'boolean':
      return schema.example !== undefined ? schema.example : true;
    case 'array':
      if (schema.items) {
        const itemData = generateDummyData(schema.items, definitions, components);
        const minItems = schema.minItems || 1;
        const maxItems = Math.min(schema.maxItems || 3, 5);
        const itemCount = Math.max(minItems, Math.min(maxItems, 2));
        return Array(itemCount).fill(null).map(() => itemData);
      }
      return [];
    case 'object':
      return generateObjectValue(schema, definitions, components);
    default:
      return schema.example || schema.default || null;
  }
};

const extractParameters = (endpoint, spec) => {
  const pathParams = {};
  const queryParams = {};
  const headers = {};

  if (endpoint.parameters) {
    endpoint.parameters.forEach((param) => {
      const schema = param.schema || param;
      const dummyValue = generateDummyData(schema, spec.definitions, spec.components);
      
      switch (param.in) {
        case 'path':
          pathParams[param.name] = dummyValue;
          break;
        case 'query':
          if (dummyValue !== null && dummyValue !== undefined) {
            queryParams[param.name] = dummyValue;
          }
          break;
        case 'header':
          if (dummyValue !== null && dummyValue !== undefined) {
            headers[param.name] = String(dummyValue);
          }
          break;
      }
    });
  }

  return { pathParams, queryParams, headers };
};

const generateRequestBody = (endpoint, spec) => {
  if (!endpoint.requestBody) return null;

  const content = endpoint.requestBody.content;
  if (!content) return null;

  const contentTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
    'application/xml'
  ];

  for (const contentType of contentTypes) {
    if (content[contentType] && content[contentType].schema) {
      const schema = content[contentType].schema;
      return generateDummyData(schema, spec.definitions, spec.components);
    }
  }

  const availableTypes = Object.keys(content);
  if (availableTypes.length > 0) {
    const firstType = availableTypes[0];
    if (content[firstType].schema) {
      return generateDummyData(content[firstType].schema, spec.definitions, spec.components);
    }
  }

  return null;
};

module.exports = {
  generateDummyData,
  extractParameters,
  generateRequestBody
}; 