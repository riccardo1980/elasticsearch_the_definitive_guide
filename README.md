# ElasticSearch

## Prerequisites
Setup is based on docker-compose. Make sure Linux host matches minimal ElasticSearc requirements. 

### docker-desktop
If you are running docker through docker-desktop, you can modify `max_map_count` VM settings with:
```
wsl -d docker-desktop
sysctl -w vm.max_map_count=262144
```
**WARNING**: change does not persists across either Windows or VM reboot.
### docker service
If you are running docker directly in your linux environment, for example through systemd services:
```
sudo sysctl -w vm.max_map_count=262144
```
**WARNING**: change does not persists across Linux reboot.

## Setup
Use provided docker compose YAML to setup a 3 nodes cluster, along with dashboard.  
Define `.env` file, starting from provided `example.env`.
```Bash
cd es-docker-compose
cp example.env .env
# optionally change .env settings
docker-compose up
```
