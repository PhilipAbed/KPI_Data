async function start(data) {
    const charts = document.getElementsByClassName("barchart");
    for (const chart of charts) {
        const ctx = chart.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.dates,
                datasets: [{
                    label: chart.id,
                    backgroundColor: [
                        "#00FF00",
                    ],
                    data: getData(chart, data),
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function getData(chart, data) {
    for (const [key, val] of Object.entries(data)) {
        console.log("reached here 1");
        console.log(chartIdToStats);
        console.log(key);
        if (chartIdToStats.has(chart.id) && chartIdToStats.get(chart.id) === key) {
            console.log("reached here 3");
            return val;
        }
    }
}

const chartIdToStats = new Map([
    ["Pull Requests Average Time Response", "prAvg"],
    ["Issues Average Time Response", "issueAvg"],
    ["Discussions Average Time Response", "discAvg"],
    ["Pull Requests Opened By Community", "communityPrs"],
    ["Issues Opened By Community", "communityIssues"],
    ["Discussions Opened By Community", "communityDiscs"],
    ["Pull Requests Opened By Maintainers", "mainPrs"],
    ["Issues Opened By Maintainers", "mainIssues"],
    ["Discussions Opened By Maintainers", "mainDiscs"],
]);