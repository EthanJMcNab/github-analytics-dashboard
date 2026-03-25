import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

const COLOURS = [
    "#38bdf8", // blue
    "#22c55e", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#a78bfa", // purple
]

function LanguageChart({ data }) {
    if (!data.length) {
        return null;
    }

    return (
        <div style={{ marginTop: "30px" }}>
            <h3>Language Breakdown</h3>
            <PieChart width="100%" height={300}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={COLOURS[index % COLOURS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
}

export default LanguageChart;