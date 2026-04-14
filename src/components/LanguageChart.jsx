import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";

const COLOURS = [
    "#3b2f2f", // deep brown
    "#6b5b4b", // warm taupe
    "#a68a64", // muted gold
    "#d8cbb8", // light beige
    "#8c6f5a", // soft brown
]

function LanguageChart({ data }) {
    if (!data.length) {
        return null;
    }

    return (
        <div className="chartWrapper">
            <h2>Language Breakdown</h2>

            <div className="chartContainer">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="46%"
                            outerRadius={120}
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={COLOURS[index % COLOURS.length]} />
                            ))}
                        </Pie>

                        <Tooltip />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default LanguageChart;