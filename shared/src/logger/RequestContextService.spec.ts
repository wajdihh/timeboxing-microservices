import { RequestContextService } from './RequestContextService';

describe('RequestContextService', () => {
  // Each test using .startRequest() or .run() creates its own clean context,
  // so a global afterEach cleanup for the ALS store is generally not needed
  // and can be complex to implement correctly for a static ALS instance.

  it('should store and retrieve a value within a context', (done) => {
    RequestContextService.startRequest(() => {
      RequestContextService.set('testKey', 'testValue');
      expect(RequestContextService.get('testKey')).toBe('testValue');
      done();
    });
  });

  it('should return undefined for a key not in context', (done) => {
    RequestContextService.startRequest(() => {
      expect(RequestContextService.get('nonExistentKey')).toBeUndefined();
      done();
    });
  });

  it('should return undefined for a key if no context is active', () => {
    // Outside of als.run/startRequest
    expect(RequestContextService.get('anyKey')).toBeUndefined();
  });

  it('should isolate contexts', (done) => {
    RequestContextService.startRequest(() => {
      RequestContextService.set('key1', 'value1');

      // Start a nested, independent context (not typical usage, but tests isolation)
      // For true nested independent contexts, one would typically use another ALS instance
      // or be very careful with how .run is called.
      // This specific test might be more about sequential contexts.
      RequestContextService.startRequest(() => {
        RequestContextService.set('key1', 'value2_nested'); // This will overwrite in the same store if not truly nested
        expect(RequestContextService.get('key1')).toBe('value2_nested');
      });
      // After the inner .startRequest's callback finishes, we are back to the outer context.
      // However, AsyncLocalStorage by default does not "revert" the store for nested calls to run on the same ALS instance.
      // The store is mutated. This test highlights a nuance of ALS.
      // For true isolation, different ALS instances or careful management is needed.
      // The inner .startRequest() creates a new context with a new Map.
      // Modifications inside it do not affect the outer context's Map.
      expect(RequestContextService.get('key1')).toBe('value1'); // Should still be value1 from the outer context
      done();
    });
  });
  
  it('should correctly use run with defaults and callback', (done) => {
    const defaults = new Map<string, unknown>();
    defaults.set('defaultKey', 'defaultValue');

    RequestContextService.run(defaults, () => {
      expect(RequestContextService.get('defaultKey')).toBe('defaultValue');
      RequestContextService.set('anotherKey', 'anotherValue');
      expect(RequestContextService.get('anotherKey')).toBe('anotherValue');
      done();
    });
  });

  it('should handle getCorrelationId and setCorrelationId', (done) => {
    RequestContextService.startRequest(() => {
      RequestContextService.setCorrelationId('test-corr-id');
      expect(RequestContextService.getCorrelationId()).toBe('test-corr-id');
      done();
    });
  });

  it('getCorrelationId should return undefined if not set', (done) => {
    RequestContextService.startRequest(() => {
      expect(RequestContextService.getCorrelationId()).toBeUndefined();
      done();
    });
  });

  // Test to ensure contexts do not interfere across async operations when properly managed
  it('should maintain context across async operations within the same run call', (done) => {
    RequestContextService.startRequest(async () => {
      RequestContextService.set('asyncKey', 'asyncValue');
      await new Promise(resolve => setTimeout(resolve, 0)); // Yield to event loop
      expect(RequestContextService.get('asyncKey')).toBe('asyncValue');
      done();
    });
  });

  it('contexts should be separate for concurrent operations (simulated)', (done) => {
    let context1Value: unknown;
    let context2Value: unknown;

    const op1 = () => {
      return RequestContextService.startRequest(async () => {
        RequestContextService.set('concurrentKey', 'value_op1');
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
        context1Value = RequestContextService.get('concurrentKey');
      });
    };

    const op2 = () => {
      return RequestContextService.startRequest(async () => {
        RequestContextService.set('concurrentKey', 'value_op2');
        await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async work
        context2Value = RequestContextService.get('concurrentKey');
      });
    };

    Promise.all([op1(), op2()]).then(() => {
      expect(context1Value).toBe('value_op1');
      expect(context2Value).toBe('value_op2');
      done();
    });
  });
});
