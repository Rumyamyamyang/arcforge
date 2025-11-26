"""
Verify relation graph structure and completeness
Checks that all items have required fields and edges are bidirectional
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple


def check_required_fields(node: Dict[str, Any]) -> List[str]:
    """Check if node has all required fields. Returns list of missing fields."""
    missing = []
    
    # Check basic fields
    if not node.get("name"):
        missing.append("name")
    if not node.get("node_type"):
        missing.append("node_type")
    
    # Only check item-specific fields for item nodes
    if node.get("node_type") == "item":
        if not node.get("wiki_url"):
            missing.append("wiki_url")
        
        # Check infobox
        infobox = node.get("infobox")
        if not infobox:
            missing.append("infobox")
        else:
            if not infobox.get("type"):
                missing.append("infobox.type")
            if not infobox.get("rarity"):
                missing.append("infobox.rarity")
        
        # Check image_urls
        image_urls = node.get("image_urls")
        if not image_urls:
            missing.append("image_urls")
        else:
            if not image_urls.get("thumb"):
                missing.append("image_urls.thumb")
    
    return missing


def get_edge_key(source: str, target: str, relation: str, 
                 input_level: str = None, output_level: str = None) -> str:
    """Create a unique key for an edge."""
    parts = [source, target, relation]
    if input_level:
        parts.append(f"in:{input_level}")
    if output_level:
        parts.append(f"out:{output_level}")
    return "||".join(parts)


def get_reverse_relation(relation: str) -> str:
    """Get the reverse relation type."""
    reverse_map = {
        "craft_from": "craft_to",
        "craft_to": "craft_from",
        "upgrade_from": "upgrade_to",
        "upgrade_to": "upgrade_from",
        "repair_from": "repair_to",
        "repair_to": "repair_from",
        "recycle_to": "recycle_from",
        "recycle_from": "recycle_to",
        "salvage_to": "salvage_from",
        "salvage_from": "salvage_to",
        "trader": "sold_by",
        "sold_by": "trader"
    }
    return reverse_map.get(relation)


def verify_bidirectional_edges(nodes: List[Dict[str, Any]]) -> Tuple[List[str], int]:
    """
    Verify that all edges have corresponding reverse edges.
    Returns (list of errors, total edge count).
    """
    errors = []
    
    # Build index of all edges
    edge_map = {}  # edge_key -> (source_node, edge_data)
    
    for node in nodes:
        node_name = node.get("name")
        if not node_name:
            continue
        
        edges = node.get("edges", [])
        for edge in edges:
            target_name = edge.get("name")
            relation = edge.get("relation")
            input_level = edge.get("input_level")
            output_level = edge.get("output_level")
            
            if not target_name or not relation:
                errors.append(f"Invalid edge in node '{node_name}': missing name or relation")
                continue
            
            # Create edge key
            edge_key = get_edge_key(node_name, target_name, relation, input_level, output_level)
            edge_map[edge_key] = (node_name, edge)
    
    # Check for reverse edges
    checked_edges = set()
    
    for edge_key, (source_node, edge) in edge_map.items():
        if edge_key in checked_edges:
            continue
        
        target_name = edge.get("name")
        relation = edge.get("relation")
        input_level = edge.get("input_level")
        output_level = edge.get("output_level")
        
        # Get reverse relation
        reverse_relation = get_reverse_relation(relation)
        
        if not reverse_relation:
            errors.append(f"Unknown relation type '{relation}' in edge {source_node} -> {target_name}")
            continue
        
        # Create reverse edge key (swap input/output levels)
        reverse_key = get_edge_key(target_name, source_node, reverse_relation, 
                                   output_level, input_level)
        
        # Check if reverse edge exists
        if reverse_key not in edge_map:
            errors.append(
                f"Missing reverse edge: {source_node} -{relation}-> {target_name} "
                f"(expected {target_name} -{reverse_relation}-> {source_node})"
            )
        else:
            # Mark both edges as checked
            checked_edges.add(edge_key)
            checked_edges.add(reverse_key)
    
    return errors, len(edge_map)


def verify_relation_graph(relation_file: Path) -> bool:
    """
    Verify relation graph structure.
    Returns True if all checks pass, False otherwise.
    """
    print(f"Verifying relation graph: {relation_file}")
    print("=" * 70)
    
    # Load relation graph
    if not relation_file.exists():
        print(f"[ERROR] {relation_file} not found!")
        return False
    
    with open(relation_file, 'r', encoding='utf-8') as f:
        nodes = json.load(f)
    
    print(f"[OK] Loaded {len(nodes)} nodes from graph")
    print()
    
    # Statistics
    total_nodes = len(nodes)
    nodes_with_edges = sum(1 for n in nodes if n.get("edges"))
    nodes_without_edges = total_nodes - nodes_with_edges
    
    # Check 1: Required fields
    print("Check 1: Required fields")
    print("-" * 70)
    
    missing_fields = {}
    for node in nodes:
        node_name = node.get("name", "<unnamed>")
        missing = check_required_fields(node)
        
        if missing:
            missing_fields[node_name] = missing
    
    if missing_fields:
        print(f"[FAIL] Found {len(missing_fields)} nodes with missing fields:")
        for node_name, fields in list(missing_fields.items())[:10]:  # Show first 10
            print(f"  - {node_name}: missing {', '.join(fields)}")
        if len(missing_fields) > 10:
            print(f"  ... and {len(missing_fields) - 10} more")
    else:
        print("[OK] All nodes have required fields")
    
    print()
    
    # Check 2: Bidirectional edges
    print("Check 2: Bidirectional edges")
    print("-" * 70)
    
    edge_errors, total_edges = verify_bidirectional_edges(nodes)
    
    if edge_errors:
        print(f"[FAIL] Found {len(edge_errors)} edge errors:")
        for error in edge_errors[:10]:  # Show first 10
            print(f"  - {error}")
        if len(edge_errors) > 10:
            print(f"  ... and {len(edge_errors) - 10} more")
    else:
        print("[OK] All edges are bidirectional")
    
    print()
    
    # Summary
    print("Summary")
    print("=" * 70)
    print(f"Total nodes: {total_nodes}")
    print(f"  - Nodes with edges: {nodes_with_edges}")
    print(f"  - Nodes without edges: {nodes_without_edges} (acceptable)")
    print(f"Total edges: {total_edges}")
    print()
    
    # Count node types
    node_types = {}
    for node in nodes:
        node_type = node.get("node_type", "unknown")
        node_types[node_type] = node_types.get(node_type, 0) + 1
    
    print("Node types:")
    for node_type, count in sorted(node_types.items()):
        print(f"  - {node_type}: {count}")
    print()
    
    # Count edge types
    edge_types = {}
    for node in nodes:
        for edge in node.get("edges", []):
            relation = edge.get("relation", "unknown")
            edge_types[relation] = edge_types.get(relation, 0) + 1
    
    print("Edge types:")
    for edge_type, count in sorted(edge_types.items()):
        print(f"  - {edge_type}: {count}")
    print()
    
    # Final result
    all_checks_passed = len(missing_fields) == 0 and len(edge_errors) == 0
    
    if all_checks_passed:
        print("[SUCCESS] All checks passed!")
    else:
        print("[FAILED] Some checks failed:")
        if missing_fields:
            print(f"  - {len(missing_fields)} nodes with missing fields")
        if edge_errors:
            print(f"  - {len(edge_errors)} edge errors")
    
    print()
    
    return all_checks_passed


def main():
    """Main function."""
    data_dir = Path(__file__).parent.parent / "data"
    relation_file = data_dir / "items_relation.json"
    
    success = verify_relation_graph(relation_file)
    
    exit(0 if success else 1)


if __name__ == "__main__":
    main()

