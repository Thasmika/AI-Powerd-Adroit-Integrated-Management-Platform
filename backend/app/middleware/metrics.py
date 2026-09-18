import time
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Request, Response
from starlette.responses import PlainTextResponse

# Define Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP Requests",
    ["method", "endpoint", "http_status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP Request Latency",
    ["method", "endpoint"]
)

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        method = request.method
        # Extract the endpoint path.
        # Note: In a production app, you might want to normalize paths (e.g., /items/{item_id})
        # to avoid exploding cardinality. Here we simply use url.path.
        endpoint = request.url.path

        start_time = time.time()
        
        try:
            response = await call_next(request)
            status_code = str(response.status_code)
        except Exception as e:
            status_code = "500"
            raise e
        finally:
            process_time = time.time() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, http_status=status_code).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(process_time)
            
        return response

def metrics_endpoint():
    """Endpoint to expose metrics to Prometheus"""
    return PlainTextResponse(generate_latest())
