function LanguageTable({ data }) {
    if (!data.length) {
        return null;
    }

    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <div className="tableWrapper">
            <h2 className="tableTitle">Language Data</h2>

            <div className="tableContainer">
                <table className="languageTable">
                    <thead>
                        <tr>
                            <th>Language</th>
                            <th className="right">Bytes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((lang, index) => (
                            <tr key={index}>
                                <td>{lang.name}</td>
                                <td className="right">
                                    {lang.value.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LanguageTable;