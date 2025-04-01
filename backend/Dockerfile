# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DB_NAME=postgres
ENV DB_USER=postgres.jfxcyutbgodrxmqlomkp
ENV DB_PASSWORD=AnsieversarY@25
ENV DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy project
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application (production)
#CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]

# Command to run the application (development)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000", "--noreload", "--nothreading"]