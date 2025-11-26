import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faExternalLinkAlt, faDiagramProject } from '@fortawesome/free-solid-svg-icons';
import { Item } from '../../types/item';
import { rarityColors, rarityGradients } from '../../config/rarityConfig';

interface ItemDetailPanelProps {
  item: Item;
  onClose: () => void;
}

const getSellPrice = (price: number | number[] | null | undefined): string => {
  if (!price) return 'N/A';
  if (Array.isArray(price)) {
    return `${price[0]} - ${price[price.length - 1]}`;
  }
  return price.toString();
};

export default function ItemDetailPanel({ item, onClose }: ItemDetailPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Detail Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-gradient-to-br from-black/95 via-purple-950/30 to-black/95 backdrop-blur-2xl border-l border-purple-500/40 z-50 overflow-y-auto animate-slide-in shadow-2xl">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <div className="relative z-10 p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-red-500/30 backdrop-blur-sm rounded-xl transition-all duration-300 text-gray-400 hover:text-red-300 border border-purple-500/20 hover:border-red-500/50 shadow-lg hover:scale-110 group"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">✕</span>
          </button>

          {/* Item Header */}
          <div className="mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold mb-5 uppercase tracking-widest backdrop-blur-sm border shadow-lg"
              style={{ 
                backgroundColor: `${rarityColors[item.infobox?.rarity] || '#717471'}30`,
                borderColor: `${rarityColors[item.infobox?.rarity] || '#717471'}60`,
                color: rarityColors[item.infobox?.rarity] || '#717471',
                boxShadow: `0 4px 20px ${rarityColors[item.infobox?.rarity] || '#717471'}30`
              }}
            >
              <FontAwesomeIcon icon={faStar} className="text-xs" />
              {item.infobox?.rarity || 'Common'}
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-purple-200 to-gray-100 mb-3 drop-shadow-lg">
              {item.name}
            </h2>
            {item.infobox?.type && (
              <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
                {item.infobox.type}
              </p>
            )}
          </div>

          {/* Item Image */}
          {item.image_urls?.thumb && (
            <div 
              className="relative w-full aspect-square rounded-2xl mb-8 flex items-center justify-center p-12 border-2 overflow-hidden group shadow-2xl"
              style={{ 
                background: rarityGradients[item.infobox?.rarity] || rarityGradients.Common,
                borderColor: `${rarityColors[item.infobox?.rarity] || '#717471'}40`,
                boxShadow: `0 8px 32px ${rarityColors[item.infobox?.rarity] || '#717471'}40, inset 0 1px 0 rgba(255,255,255,0.1)`
              }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <img
                src={item.image_urls.thumb}
                alt={item.name}
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          )}

          {/* Stats */}
          <div className="space-y-3 mb-8">
            {item.infobox?.weight != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-400 font-medium">Weight:</span>
                <span className="text-lg text-gray-100 font-semibold">{item.infobox.weight}</span>
              </div>
            )}
            {item.infobox?.sellprice != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-400 font-medium">Sell Price:</span>
                <span className="text-lg text-emerald-400 font-semibold">{getSellPrice(item.infobox.sellprice)}</span>
              </div>
            )}
            {item.infobox?.stacksize != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-400 font-medium">Stack Size:</span>
                <span className="text-lg text-gray-100 font-semibold">{item.infobox.stacksize}</span>
              </div>
            )}
            {item.infobox?.damage != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-400 font-medium">Damage:</span>
                <span className="text-lg text-red-400 font-semibold">{item.infobox.damage}</span>
              </div>
            )}
          </div>

          {/* Sources */}
          {item.sources && item.sources.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 mb-4 uppercase tracking-wider">
                Sources
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.sources.map((source: string, idx: number) => (
                  <span
                    key={idx}
                    className="group relative px-4 py-2 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-sm text-blue-200 rounded-xl text-xs font-semibold border border-blue-400/40 hover:border-blue-400/60 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                  >
                    <span className="relative z-10">{source}</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={item.wiki_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block py-4 bg-gradient-to-br from-purple-500/30 to-purple-600/30 hover:from-purple-500/40 hover:to-purple-600/40 backdrop-blur-sm border border-purple-400/50 hover:border-purple-400/70 rounded-xl text-center text-purple-200 hover:text-purple-100 font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                View on Wiki
              </span>
            </a>
            <a
              href={`/crafting-graph?item=${encodeURIComponent(item.name)}`}
              className="group relative block py-4 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 hover:from-blue-500/40 hover:to-cyan-500/40 backdrop-blur-sm border border-blue-400/50 hover:border-blue-400/70 rounded-xl text-center text-blue-200 hover:text-blue-100 font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                <FontAwesomeIcon icon={faDiagramProject} />
                View in Crafting Graph
              </span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

