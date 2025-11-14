import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app
from mangum import Mangum

# Wrap FastAPI app with Mangum for serverless compatibility
handler = Mangum(app, lifespan="off")

