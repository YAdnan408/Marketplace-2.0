import os
import sys

# Add the backend/ directory (parent of this file's folder) to sys.path,
# since Vercel's Python runtime only puts api/ on the path by default —
# not its parent, where the "app" package actually lives.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
