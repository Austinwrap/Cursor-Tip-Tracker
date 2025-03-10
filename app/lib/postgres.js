// This is a mock version of the postgres client for compatibility
// The actual postgres functionality has been removed to use localStorage instead

// Mock SQL template tag function
const sql = (strings, ...values) => {
  console.log('Mock SQL query:', strings.join('?'), values);
  return Promise.resolve([]);
};

// Add mock methods
sql.begin = () => ({
  savepoint: () => ({
    query: () => Promise.resolve([]),
    commit: () => Promise.resolve()
  }),
  commit: () => Promise.resolve()
});

export default sql; 