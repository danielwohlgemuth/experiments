FROM python:3.13.3-slim-bookworm AS build
RUN apt update && \
    apt install -y git
RUN git clone --depth=1 https://github.com/little-angry-clouds/prometheus-data-generator /prometheus-data-generator

FROM python:3.13.3-slim-bookworm
COPY --from=build /prometheus-data-generator/requirements.txt ./tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

RUN useradd --create-home appuser
USER appuser
WORKDIR /home/appuser
COPY --from=build /prometheus-data-generator/prometheus_data_generator .

CMD [ "python", "./main.py" ]