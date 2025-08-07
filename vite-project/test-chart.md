# Chart Test

Here's a simple bar chart:

<chart>
config = {
    "type": "bar",
    "data": {
        "labels": ["January", "February", "March", "April"],
        "datasets": [{
            "label": "Sales",
            "data": [12, 19, 3, 5],
            "backgroundColor": "rgba(75, 192, 192, 0.2)",
            "borderColor": "rgba(75, 192, 192, 1)",
            "borderWidth": 1
        }]
    },
    "options": {
        "responsive": true,
        "plugins": {
            "title": {
                "display": true,
                "text": "Monthly Sales"
            }
        }
    }
}
</chart>

And here's a line chart:

<chart>
config = {
    "type": "line",
    "data": {
        "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "datasets": [{
            "label": "Growth",
            "data": [10, 25, 15, 30],
            "borderColor": "rgb(255, 99, 132)",
            "backgroundColor": "rgba(255, 99, 132, 0.2)"
        }]
    },
    "options": {
        "responsive": true,
        "plugins": {
            "title": {
                "display": true,
                "text": "Weekly Growth"
            }
        }
    }
}
</chart>

That's it!