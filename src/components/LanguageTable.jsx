function LanguageTable({ data }) {
    if (!data.length) {
        return null;
    }

    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>Language Data</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
                            Language
                        </th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid #444" }}>
                            Bytes
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((lang, index) => (
                        <tr key={index}>
                            <td style={{ padding: "6px 0" }}>{lang.name}</td>
                            <td style={{ textAlign: "right", padding: "6px 0" }}>
                                {lang.value.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default LanguageTable;