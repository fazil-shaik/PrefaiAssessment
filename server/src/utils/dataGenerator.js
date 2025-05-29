const generateDummyData = (schema) => {
  if (!schema) return null;

  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum[0];
      }
      if (schema.format === 'email') {
        return 'test@example.com';
      }
      if (schema.format === 'date') {
        return new Date().toISOString().split('T')[0];
      }
      if (schema.format === 'date-time') {
        return new Date().toISOString();
      }
      return 'test_string';

    case 'number':
    case 'integer':
      if (schema.minimum !== undefined) {
        return schema.minimum;
      }
      if (schema.maximum !== undefined) {
        return schema.maximum;
      }
      return 0;

    case 'boolean':
      return true;

    case 'array':
      if (schema.items) {
        return [generateDummyData(schema.items)];
      }
      return [];

    case 'object':
      const result = {};
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, value]) => {
          result[key] = generateDummyData(value);
        });
      }
      return result;

    default:
      return null;
  }
};

module.exports = {
  generateDummyData
}; 