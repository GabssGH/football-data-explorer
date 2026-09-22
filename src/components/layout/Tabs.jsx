import './Tabs.css';

/**
 * Abas simples e controladas de fora (o estado de qual aba está ativa
 * vive na página, não aqui — mantém o componente burro e reutilizável).
 */
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className="tabs__button"
          data-active={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
