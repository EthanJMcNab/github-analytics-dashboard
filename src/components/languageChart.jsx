import { PieChart, Pie, Tooltip, Legend } from "recharts";

function languageChart({ data }) {
    if (!data.length) {
        return null;
    }

    return (
        <div style={{ marginTop: "30px" }}>
            <h3>Language Breakdown</h3>
            <PieChart width={400} height={300}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                />
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
}

export default LanguageChart;