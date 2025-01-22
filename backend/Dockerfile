FROM python:3.12-slim-bookworm

ENV FLASK_APP sweet.py
ENV FLASK_ENV production

COPY requirements.txt ./
RUN pip install -r requirements.txt
RUN pip install gunicorn

COPY api api
COPY migrations migrations
COPY media media
COPY sweet.py config.py boot.sh ./

EXPOSE 5000
CMD ./boot.sh
