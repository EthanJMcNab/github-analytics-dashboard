import LanguageChart from "./LanguageChart";
import LanguageTable from "./LanguageTable";

function LanguageSection({ languages }) {
  if (!languages.length) {
    return null;
  }

  return (
    <section className="languagesSection">
      <div className="languagesGrid">
        <div className="card">
          <LanguageChart data={languages} />
        </div>

        <div className="card">
          <LanguageTable data={languages} />
        </div>
      </div>
    </section>
  );
}

export default LanguageSection;
