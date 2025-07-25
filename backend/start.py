#!/usr/bin/env python3
"""
FinTwin+ Backend Startup Script

This script helps set up and start the FinTwin+ backend server.
It handles database initialization, dependency checks, and server startup.
"""

import os
import sys
import subprocess
import asyncio
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are installed."""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'python-jose',
        'passlib',
        'python-multipart',
        'python-dotenv'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} (missing)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("   Run: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed")
    return True

def check_env_file():
    """Check if .env file exists."""
    env_path = Path(".env")
    if not env_path.exists():
        print("⚠️  .env file not found")
        print("   Copying from .env.example...")
        
        example_path = Path(".env.example")
        if example_path.exists():
            import shutil
            shutil.copy(example_path, env_path)
            print("✅ .env file created from example")
            print("   Please update the API keys in .env file")
        else:
            print("❌ .env.example file not found")
            return False
    else:
        print("✅ .env file found")
    
    return True

def create_directories():
    """Create necessary directories."""
    print("📁 Creating directories...")
    
    directories = [
        "uploads",
        "logs",
        "backups",
        "temp"
    ]
    
    for directory in directories:
        dir_path = Path(directory)
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"   ✅ Created {directory}/")
        else:
            print(f"   ✅ {directory}/ exists")

def check_database():
    """Check if database exists and is initialized."""
    print("🗄️  Checking database...")
    
    db_path = Path("fintwin.db")
    if not db_path.exists():
        print("   ⚠️  Database not found, will be created on first run")
        return True
    else:
        print("   ✅ Database file exists")
        return True

def initialize_database():
    """Initialize the database with initial data."""
    print("🚀 Initializing database...")
    
    try:
        # Import and run the database initialization
        from init_db import main as init_main
        result = init_main()
        
        if result == 0:
            print("✅ Database initialized successfully")
            return True
        else:
            print("❌ Database initialization failed")
            return False
            
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

def start_server(host="127.0.0.1", port=8000, reload=True):
    """Start the FastAPI server."""
    print(f"🚀 Starting FinTwin+ server on {host}:{port}...")
    print("")
    print("📋 Server Information:")
    print(f"   • API Documentation: http://{host}:{port}/docs")
    print(f"   • Alternative Docs: http://{host}:{port}/redoc")
    print(f"   • Health Check: http://{host}:{port}/health")
    print("")
    print("🔑 Default Admin Credentials:")
    print("   • Email: admin@fintwin.com")
    print("   • Password: admin123")
    print("")
    print("⚠️  Remember to:")
    print("   • Update API keys in .env file")
    print("   • Change default admin password")
    print("   • Configure CORS origins for production")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def install_dependencies():
    """Install dependencies from requirements.txt."""
    print("📦 Installing dependencies...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def main():
    """Main startup function."""
    print("🎯 FinTwin+ Backend Startup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        return 1
    
    # Check if we need to install dependencies
    if not check_dependencies():
        print("\n🔧 Installing missing dependencies...")
        if not install_dependencies():
            return 1
        print("\n🔍 Rechecking dependencies...")
        if not check_dependencies():
            return 1
    
    # Check environment file
    if not check_env_file():
        return 1
    
    # Create necessary directories
    create_directories()
    
    # Check database
    if not check_database():
        return 1
    
    # Initialize database if needed
    db_path = Path("fintwin.db")
    if not db_path.exists() or db_path.stat().st_size == 0:
        if not initialize_database():
            return 1
    
    print("\n" + "=" * 40)
    print("✅ All checks passed!")
    print("=" * 40)
    
    # Start the server
    start_server()
    
    return 0

def quick_start():
    """Quick start without full checks (for development)."""
    print("⚡ FinTwin+ Quick Start")
    print("=" * 30)
    
    # Basic checks
    if not check_python_version():
        return 1
    
    # Create directories
    create_directories()
    
    # Start server
    start_server()
    
    return 0

def setup_only():
    """Run setup without starting the server."""
    print("🔧 FinTwin+ Setup Only")
    print("=" * 30)
    
    # Check Python version
    if not check_python_version():
        return 1
    
    # Install dependencies
    if not check_dependencies():
        if not install_dependencies():
            return 1
    
    # Check environment file
    if not check_env_file():
        return 1
    
    # Create directories
    create_directories()
    
    # Initialize database
    if not initialize_database():
        return 1
    
    print("\n✅ Setup completed successfully!")
    print("   Run 'python start.py' to start the server")
    
    return 0

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="FinTwin+ Backend Startup Script")
    parser.add_argument(
        "--quick", 
        action="store_true", 
        help="Quick start without full dependency checks"
    )
    parser.add_argument(
        "--setup-only", 
        action="store_true", 
        help="Run setup without starting the server"
    )
    parser.add_argument(
        "--host", 
        default="127.0.0.1", 
        help="Host to bind the server to (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port", 
        type=int, 
        default=8000, 
        help="Port to bind the server to (default: 8000)"
    )
    parser.add_argument(
        "--no-reload", 
        action="store_true", 
        help="Disable auto-reload in development"
    )
    
    args = parser.parse_args()
    
    try:
        if args.setup_only:
            exit_code = setup_only()
        elif args.quick:
            exit_code = quick_start()
        else:
            exit_code = main()
        
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print("\n👋 Startup cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)