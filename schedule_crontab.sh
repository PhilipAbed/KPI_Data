#!/bin/bash

#extract discussions that were updated 1.1 days ago and fill them in the table if they dont exist
docker run --rm --env-file "./.env_file" kpi:1.0 ed

#extract issues that were updated 1.1 days ago and fill them in the table if they dont exist
docker run --rm --env-file "./.env_file" kpi:1.0 ei

#extract pull_requests that were updated 1.1 days ago and fill them in the table if they dont exist
docker run --rm --env-file "./.env_file" kpi:1.0 ep


# sync={{number of days}} will update weekly history as candles to the stats table
# if you set 28 days, it will add 4 rows to the table for each week, each row in stats table is a candle in the graph
# changing the weekly status will require you to re-create the table  and change the 'get7daysAgo' function
docker run --rm --env-file "./.env_file" kpi:1.0 sync=7

# export={{number of weeks} will show us data for today until 10 weeks ago (10 candles in graph chart)
# this depends on the stats table that we fill in "sync"
docker run --rm --env-file "./.env_file" kpi:1.0 export=10