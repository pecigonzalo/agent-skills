# Complete observability integration example

## Example: Complete Observability Integration

```javascript
// Set up structured logger with context
const logger = createLogger({
  format: 'json',
  defaultContext: {
    service: 'order-service',
    environment: process.env.NODE_ENV
  }
});

// Add request context middleware
app.use((req, res, next) => {
  const traceId = req.headers['x-trace-id'] || generateId();
  logger.setContext({ traceId, userId: req.user?.id });
  res.setHeader('x-trace-id', traceId);
  next();
});

// Track API performance
app.use((req, res, next) => {
  const timer = metrics.startTimer('api.request.duration');
  
  res.on('finish', () => {
    timer.end({
      method: req.method,
      path: req.path,
      status: res.status
    });
    
    if (res.status >= 400) {
      metrics.increment('api.errors', 1, {
        status: res.status,
        path: req.path
      });
    }
  });
  
  next();
});

// Example: Observable business operation
async function createOrder(customerId, items) {
  try {
    logger.info('Creating order', { customerId, itemCount: items.length });
    
    const timer = metrics.startTimer('order.creation.duration');
    const order = await database.orders.create({
      customerId,
      items,
      createdAt: new Date()
    });
    timer.end();
    
    metrics.increment('orders.created', 1, {
      itemCount: items.length
    });
    
    logger.info('Order created successfully', {
      orderId: order.id,
      customerId,
      total: order.total
    });
    
    return { success: true, order };
    
  } catch (error) {
    metrics.increment('order.creation.errors', 1);
    
    logger.error('Order creation failed', {
      customerId,
      errorCode: error.code,
      errorMessage: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}
```

---
