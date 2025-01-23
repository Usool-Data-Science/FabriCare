FROM python:3.10.6-slim-buster

# Install curl and other dependencies
RUN apt-get update && apt-get install -y curl && apt-get clean

# Set environment variables
ENV FLASK_APP sweet.py
ENV FLASK_ENV production

# Copy requirements file and install Python dependencies
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Install database and server dependencies
RUN pip install gunicorn pymysql cryptography

# Copy application code
COPY api api
# COPY media media
COPY sweet.py config.py boot.sh ./

# Conditionally copy migrations folder if it exists
# RUN if [ -d "migrations" ]; then cp -r migrations ./; fi

# Expose Flask app port
EXPOSE 5000

# Start the application using boot.sh
CMD ["./boot.sh"]
