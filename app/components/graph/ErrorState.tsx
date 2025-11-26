import Header from '../Header';

interface ErrorStateProps {
  itemName: string;
}

export default function ErrorState({ itemName }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-[#07020b] text-gray-100 flex flex-col">
      <Header activePage="graph" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Item not found</h2>
          <p className="text-gray-500 mb-4">"{itemName}" could not be found in the database</p>
          <a
            href="/crafting-graph?item=Power%20Rod"
            className="px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all inline-block"
          >
            Go to Power Rod
          </a>
        </div>
      </div>
    </div>
  );
}

