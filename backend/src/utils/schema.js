module.exports = {
    normalizeSchema: (schema) => {
      if (!schema) return null;
  
      // If schema is flat, wrap in "users" table
      if (!Object.values(schema).some(value => typeof value === 'object' && value !== null)) {
        schema = { users: schema };
      }
  
      const normalizeSqlType = (type) => {
        if (typeof type !== 'string') return 'varchar';
        const typeMap = {
          string: 'varchar',
          integer: 'int',
          datetime: 'timestamp',
          boolean: 'boolean',
          float: 'float'
        };
        return typeMap[type.toLowerCase()] || type.toLowerCase();
      };
  
      Object.values(schema).forEach(table => {
        Object.keys(table).forEach(field => {
          table[field] = normalizeSqlType(table[field]);
        });
      });
  
      return schema;
    }
  };