'use client';

import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import cytoscape from 'cytoscape';
import { useSearchParams } from 'next/navigation';
import itemsRelationData from '../../data/items_relation.json';
import Header from '../components/Header';
import LoadingState from '../components/graph/LoadingState';
import ErrorState from '../components/graph/ErrorState';
import { ItemData, NodeInfo } from '../types/graph';
import { cytoscapeStyles } from '../config/cytoscapeStyles';
import { buildGraphElements, buildLayoutPositions } from '../utils/graphHelpers';

function CraftingTreeContent() {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [isReady, setIsReady] = useState(false);
  const searchParams = useSearchParams();
  
  const itemName = searchParams.get('item') || 'Power Rod';

  // Find the selected item and build item lookup
  const { selectedItem, itemsLookup } = useMemo(() => {
    const lookup = new Map<string, ItemData>();
    (itemsRelationData as ItemData[]).forEach(item => {
      lookup.set(item.name, item);
    });
    const selected = lookup.get(itemName);
    return { selectedItem: selected, itemsLookup: lookup };
  }, [itemName]);

  // Ensure DOM is ready
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current) {
      return;
    }

    // Get current item data
    const currentItem = itemsLookup.get(itemName);
    if (!currentItem) {
      return;
    }

    // Build graph elements from actual data
    const { elements, leftGrouped, rightGrouped } = buildGraphElements(currentItem, itemsLookup);

    let cy;
    try {
      cy = cytoscape({
        container: containerRef.current,
        elements: elements,
        style: cytoscapeStyles as any,
        layout: {
          name: 'preset',
          positions: buildLayoutPositions(elements, leftGrouped, rightGrouped),
          fit: true,
          padding: 120,
        },
        // Enable interactivity
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      });

    } catch (error) {
      console.error('Error initializing Cytoscape:', error);
      return;
    }

    cyRef.current = cy;

    // Force a resize and fit after a short delay to ensure container is sized
    setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 150);
        
        const centerNode = cyRef.current.$('[type="center"]');
        const currentZoom = cyRef.current.zoom();
        
        // Calculate zoom needed to make center node properly visible
        const containerHeight = cyRef.current.height();
        const centerNodeHeight = 250;
        const targetNodeScreenHeight = containerHeight * 0.22;
        const targetZoom = targetNodeScreenHeight / centerNodeHeight;
        
        // Zoom in if current zoom is significantly smaller than target (many nodes)
        if (currentZoom < targetZoom * 0.8) {
          const finalZoom = Math.max(currentZoom * 1.5, targetZoom);
          
          cyRef.current.animate({
            zoom: finalZoom,
            center: {
              eles: centerNode,
            },
          }, {
            duration: 1300,
            easing: 'ease-out-cubic',
          });
        } else {
          // Graph is already big (few nodes), do a slight zoom out for dynamic feel
          const finalZoom = currentZoom * 0.85;
          
          cyRef.current.animate({
            zoom: finalZoom,
            center: {
              eles: centerNode,
            },
          }, {
            duration: 1300,
            easing: 'ease-out-cubic',
          });
        }
      }
    }, 100);

    // Handle node clicks - navigate to item if not center node
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data();
      
      if (nodeData.type !== 'center' && nodeData.itemName) {
        // Navigate to the clicked item
        window.location.href = `/crafting-graph?item=${encodeURIComponent(nodeData.itemName)}`;
      } else {
        setSelectedNode({
          id: nodeData.id,
          label: nodeData.label,
          type: nodeData.type,
          rarity: nodeData.rarity,
        });
      }
    });

    // Handle background clicks
    cy.on('tap', (event) => {
      if (event.target === cy) {
        setSelectedNode(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [isReady, itemName, itemsLookup]);

  // Show loading or error state
  if (!isReady) {
    return <LoadingState />;
  }

  if (!selectedItem) {
    return <ErrorState itemName={itemName} />;
  }

  return (
    <div className="h-screen bg-[#07020b] text-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <Header activePage="graph" />

      {/* Graph Canvas */}
      <div className="flex-1 relative bg-[#07020b] overflow-hidden">
        <div 
          ref={containerRef}
          className="w-full h-full"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, rgba(7, 2, 11, 1) 100%)'
          }}
        />
      </div>
    </div>
  );
}

export default function CraftingTree() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CraftingTreeContent />
    </Suspense>
  );
}
