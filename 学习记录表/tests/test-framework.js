/**
 * Minimal Test Framework
 * A zero-dependency browser-based test framework
 */

const TestFramework = {
  tests: [],
  results: {
    passed: 0,
    failed: 0,
    total: 0
  },
  currentSuite: null,
  currentTest: null,

  /**
   * Describe a test suite
   * @param {string} name - Suite name
   * @param {Function} fn - Test function
   */
  describe(name, fn) {
    this.currentSuite = name;
    console.log(`\n📦 Suite: ${name}`);
    fn();
    this.currentSuite = null;
  },

  /**
   * Define a test case
   * @param {string} name - Test name
   * @param {Function} fn - Test function
   */
  it(name, fn) {
    this.currentTest = name;
    const test = {
      suite: this.currentSuite,
      name: name,
      fn: fn,
      passed: false,
      error: null
    };
    
    this.tests.push(test);
    this.results.total++;
    
    try {
      fn();
      test.passed = true;
      this.results.passed++;
      console.log(`  ✅ ${name}`);
    } catch (error) {
      test.passed = false;
      test.error = error;
      this.results.failed++;
      console.log(`  ❌ ${name}`);
      console.log(`     Error: ${error.message}`);
    }
    
    this.currentTest = null;
  },

  /**
   * Assert equality
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Custom message
   */
  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
      );
    }
  },

  /**
   * Assert deep equality for objects/arrays
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Custom message
   */
  assertDeepEqual(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    
    if (actualStr !== expectedStr) {
      throw new Error(
        message || `Expected ${expectedStr}, but got ${actualStr}`
      );
    }
  },

  /**
   * Assert truthiness
   * @param {*} value - Value to check
   * @param {string} message - Custom message
   */
  assertTrue(value, message = '') {
    if (!value) {
      throw new Error(message || `Expected truthy value, but got ${value}`);
    }
  },

  /**
   * Assert falsiness
   * @param {*} value - Value to check
   * @param {string} message - Custom message
   */
  assertFalse(value, message = '') {
    if (value) {
      throw new Error(message || `Expected falsy value, but got ${value}`);
    }
  },

  /**
   * Assert that a function throws an error
   * @param {Function} fn - Function to execute
   * @param {string} message - Custom message
   */
  assertThrows(fn, message = '') {
    let threw = false;
    try {
      fn();
    } catch (error) {
      threw = true;
    }
    
    if (!threw) {
      throw new Error(message || 'Expected function to throw an error');
    }
  },

  /**
   * Assert that a value is null
   * @param {*} value - Value to check
   * @param {string} message - Custom message
   */
  assertNull(value, message = '') {
    if (value !== null) {
      throw new Error(message || `Expected null, but got ${value}`);
    }
  },

  /**
   * Assert that a value is not null
   * @param {*} value - Value to check
   * @param {string} message - Custom message
   */
  assertNotNull(value, message = '') {
    if (value === null) {
      throw new Error(message || 'Expected value to not be null');
    }
  },

  /**
   * Assert that a value is undefined
   * @param {*} value - Value to check
   * @param {string} message - Custom message
   */
  assertUndefined(value, message = '') {
    if (value !== undefined) {
      throw new Error(message || `Expected undefined, but got ${value}`);
    }
  },

  /**
   * Assert that a value is defined (not undefined)
   * @param {*} value - Value to check
   * @param {string} message - Custom message
   */
  assertDefined(value, message = '') {
    if (value === undefined) {
      throw new Error(message || 'Expected value to be defined');
    }
  },

  /**
   * Assert that an array/object contains a value
   * @param {Array|Object} container - Container to check
   * @param {*} value - Value to find
   * @param {string} message - Custom message
   */
  assertContains(container, value, message = '') {
    let found = false;
    
    if (Array.isArray(container)) {
      found = container.includes(value);
    } else if (typeof container === 'object') {
      found = Object.values(container).includes(value);
    } else if (typeof container === 'string') {
      found = container.includes(value);
    }
    
    if (!found) {
      throw new Error(
        message || `Expected container to contain ${JSON.stringify(value)}`
      );
    }
  },

  /**
   * Assert that a value is of a specific type
   * @param {*} value - Value to check
   * @param {string} type - Expected type
   * @param {string} message - Custom message
   */
  assertType(value, type, message = '') {
    const actualType = typeof value;
    if (actualType !== type) {
      throw new Error(
        message || `Expected type ${type}, but got ${actualType}`
      );
    }
  },

  /**
   * Assert that two values are close (for floating point)
   * @param {number} actual - Actual value
   * @param {number} expected - Expected value
   * @param {number} delta - Allowed difference
   * @param {string} message - Custom message
   */
  assertClose(actual, expected, delta = 0.01, message = '') {
    if (Math.abs(actual - expected) > delta) {
      throw new Error(
        message || `Expected ${expected} ± ${delta}, but got ${actual}`
      );
    }
  },

  /**
   * Setup function to run before each test
   * @param {Function} fn - Setup function
   */
  beforeEach(fn) {
    // Store for later use
    this._beforeEach = fn;
  },

  /**
   * Teardown function to run after each test
   * @param {Function} fn - Teardown function
   */
  afterEach(fn) {
    // Store for later use
    this._afterEach = fn;
  },

  /**
   * Get all test results
   * @returns {Object} Test results
   */
  getResults() {
    return {
      ...this.results,
      tests: this.tests
    };
  },

  /**
   * Clear all tests
   */
  reset() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
    this.currentSuite = null;
    this.currentTest = null;
  },

  /**
   * Display results in the DOM
   * @param {HTMLElement} container - Container element
   */
  displayResults(container) {
    const html = `
      <div class="test-results">
        <h2>Test Results</h2>
        <div class="summary ${this.results.failed === 0 ? 'passed' : 'failed'}">
          <span class="total">Total: ${this.results.total}</span>
          <span class="passed">✅ Passed: ${this.results.passed}</span>
          <span class="failed">❌ Failed: ${this.results.failed}</span>
        </div>
        <div class="test-list">
          ${this.tests.map(test => `
            <div class="test-item ${test.passed ? 'passed' : 'failed'}">
              <div class="test-header">
                <span class="status">${test.passed ? '✅' : '❌'}</span>
                <span class="suite">${test.suite}</span>
                <span class="name">${test.name}</span>
              </div>
              ${test.error ? `
                <div class="error">
                  <strong>Error:</strong> ${test.error.message}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
};

// Export to global scope
window.TestFramework = TestFramework;

// Aliases for convenience
window.describe = TestFramework.describe.bind(TestFramework);
window.it = TestFramework.it.bind(TestFramework);
window.assertEqual = TestFramework.assertEqual.bind(TestFramework);
window.assertDeepEqual = TestFramework.assertDeepEqual.bind(TestFramework);
window.assertTrue = TestFramework.assertTrue.bind(TestFramework);
window.assertFalse = TestFramework.assertFalse.bind(TestFramework);
window.assertThrows = TestFramework.assertThrows.bind(TestFramework);
window.assertNull = TestFramework.assertNull.bind(TestFramework);
window.assertNotNull = TestFramework.assertNotNull.bind(TestFramework);
window.assertUndefined = TestFramework.assertUndefined.bind(TestFramework);
window.assertDefined = TestFramework.assertDefined.bind(TestFramework);
window.assertContains = TestFramework.assertContains.bind(TestFramework);
window.assertType = TestFramework.assertType.bind(TestFramework);
window.assertClose = TestFramework.assertClose.bind(TestFramework);