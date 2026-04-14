import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

function CommitActivityChart({ data }) {
    if (!data.length) {
        return null;
    }

    return (
        <div className="commitChartWrapper">
            <h2 className="commitTitle">Commit Activity</h2>

            <div className="commitChartContainer">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid vertical={false} stroke="#e7dfd2" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="commits" fill="#5a4632" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default CommitActivityChart;