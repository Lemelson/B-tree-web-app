import VisualizerTreeNode, { VisualizerNodeLeaf } from "../visualizer/visualizer-tree";
import Sequence, { Frame } from "../visualizer/frame";

export class BTreeNode {
    constructor(isLeaf) {
        /**
         * @type {number[]} list of values in the node
         */
        this.values = [];
        /**
         * @type {boolean} is a leaf
         */
        this.leaf = isLeaf;
        /**
         * @type {BTreeNode[]}
         */
        this.children = [];
        /**
         * Reference to the tree its belong.
         * @type {BTree}
         */
        this.tree = null;
        /**
         * @type {BTreeNode}
         */
        this.parent = null;
        /**
         * @type {number[]} list of highlighted values
         */
        this.highlighted = [];
    }

    /**
     * Number of values
     * @returns {number}
     */
    get n() {
        return this.values.length;
    }

    /**
     * Add value. Add frames to the given sequence
     * @param {number} value
     * @param {Sequence} sequence
     */
    addValue(value, sequence) {
        if (value === undefined || value === null) {
            return;
        }
        let pos = 0;
        // Add frame for each value compared
        if (this.n > 1 && sequence) {
            this.highlighted = [this.values[pos]];
            sequence.addFrame(new Frame(this.tree.toJSON(this.tree.root)));
        }
        while (pos < this.n && this.values[pos] < value) {
            pos += 1;
            if (pos < this.n && sequence) {
                this.highlighted = [this.values[pos]];
                sequence.addFrame(new Frame(this.tree.toJSON(this.tree.root)));
            }
        }
        this.values.splice(pos, 0, value);
        if (sequence) {
            this.highlighted = [this.values[pos]];
            sequence.addFrame(new Frame(this.tree.toJSON(this.tree.root)));
        }
    }

    /**
     * Delete value and return it
     * @param {number} pos position
     * @return {number}
     */
    removeValue(pos) {
        if (pos >= this.n) {
            return null;
        }
        return this.values.splice(pos, 1)[0];
    }

    /**
     * Add child node at position pos
     * @param {BTreeNode} node
     * @param {number} pos
     */
    addChild(node, pos) {
        this.children.splice(pos, 0, node);
        node.parent = this;
        node.tree = this.tree;
    }
    /**
     * Delete node from position and return it
     * @param {number} pos
     * @return {BTreeNode}
     */
    deleteChild(pos) {
        return this.children.splice(pos, 1)[0];
    }

    /**
     * Reset highlighting state for the node.
     */
    clearHighlights() {
        this.highlighted = [];
    }
}

/**
 * btree namespace.
 * @type {BTree}
 */
export default class BTree {
    constructor(order) {
        /** @type {number} */
        this.order = order;
        /**
         * Root node of the tree.
         * @type {BTreeNode}
         */
        this.root = new BTreeNode(true);
        this.root.tree = this;
    }

    /**
     * Reset the tree preserving or updating its order.
     * @param {number} [order]
     */
    reset(order = this.order) {
        this.order = order;
        this.root = new BTreeNode(true);
        this.root.tree = this;
    }

    /**
     * Normalizes incoming values and ensures we work with integers.
     * @param {number} value
     * @returns {number | null}
     */
    normalizeValue(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || !Number.isInteger(numeric)) {
            return null;
        }
        return numeric;
    }

    /**
     * Check if the tree already contains a value.
     * @param {number} value
     * @returns {boolean}
     */
    contains(value) {
        const normalized = this.normalizeValue(value);
        if (normalized === null) {
            return false;
        }
        let node = this.root;
        while (node) {
            let position = 0;
            while (position < node.n && normalized > node.values[position]) {
                position += 1;
            }
            if (position < node.n && node.values[position] === normalized) {
                return true;
            }
            if (node.leaf) {
                return false;
            }
            node = node.children[position];
        }
        return false;
    }

    /**
     * Return flattened sorted values of the tree.
     * @param {BTreeNode} [node]
     * @returns {number[]}
     */
    toSortedArray(node = this.root) {
        if (!node) {
            return [];
        }
        const result = [];
        for (let i = 0; i < node.n; i += 1) {
            if (!node.leaf) {
                result.push(...this.toSortedArray(node.children[i]));
            }
            result.push(node.values[i]);
        }
        if (!node.leaf) {
            result.push(...this.toSortedArray(node.children[node.n]));
        }
        return result;
    }

    /**
     * Collect aggregated information about the tree.
     * @returns {{ order: number, height: number, nodeCount: number, keyCount: number }}
     */
    getStats() {
        if (!this.root) {
            return {
                order: this.order,
                height: 0,
                nodeCount: 0,
                keyCount: 0,
            };
        }

        const traverse = (node, depth) => {
            let nodeCount = 1;
            let keyCount = node.values.length;
            let maxDepth = depth;

            if (!node.leaf) {
                for (let i = 0; i < node.children.length; i += 1) {
                    const childStats = traverse(node.children[i], depth + 1);
                    nodeCount += childStats.nodeCount;
                    keyCount += childStats.keyCount;
                    maxDepth = Math.max(maxDepth, childStats.height);
                }
            }

            return { nodeCount, keyCount, height: maxDepth };
        };

        return {
            order: this.order,
            ...traverse(this.root, 1),
        };
    }

    /**
     * Search a value in the Tree and return the node. O(log N)
     * @param {number} value
     * @returns {{ sequence: Sequence, node: BTreeNode | null }}
     */
    searchValue(value) {
        const normalized = this.normalizeValue(value);
        const sequence = new Sequence();
        if (normalized === null) {
            return { sequence, node: null };
        }

        let node = null;
        let actual = this.root;
        while (!node && actual) {
            actual.highlighted = [...actual.values];
            sequence.addFrame(new Frame(this.toJSON(this.root)));

            if (actual.values.includes(normalized)) {
                for (let i = 0; i < actual.values.length; i += 1) {
                    actual.highlighted = [actual.values[i]];
                    sequence.addFrame(new Frame(this.toJSON(this.root)));
                    if (actual.values[i] === normalized) {
                        node = actual;
                        break;
                    }
                }
            } else if (actual.leaf) {
                actual = null;
            } else {
                let child = 0;
                while (child < actual.n && actual.values[child] < normalized) {
                    actual.highlighted = [actual.values[child]];
                    sequence.addFrame(new Frame(this.toJSON(this.root)));
                    child += 1;
                }
                if (actual.n > 0) {
                    actual.highlighted = [actual.values[Math.min(child, actual.n - 1)]];
                    sequence.addFrame(new Frame(this.toJSON(this.root)));
                }
                actual = actual.children[child];
            }
        }
        return { sequence, node };
    }

    /**
     * Deletes the value from the Tree. O(log N)
     * @param {number} value
     * @returns {Sequence}
     */
    delete(value) {
        const normalized = this.normalizeValue(value);
        const sequence = new Sequence();
        if (normalized === null || this.root.n === 0) {
            return sequence;
        }
        if (this.root.n === 1 && !this.root.leaf &&
            this.root.children[0].n === this.order - 1 && this.root.children[1].n === this.order - 1) {
            this.root.highlighted = [this.root.values[0]];
            this.root.children[1].highlighted = [this.root.children[1].values[0]];
            this.root.children[0].highlighted = [this.root.children[0].values[0]];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
            // Check if the root can shrink the tree into its childs
            this.mergeNodes(this.root.children[1], this.root.children[0], sequence);
            this.root = this.root.children[0];
            this.root.parent = null;
            this.root.tree = this;
        }
        if (this.root.n >= 1) {
            // Insert frame with the whole node highlighted
            this.root.highlighted = [...this.root.values];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
        }
        // Start looking for the value to delete
        this.deleteFromNode(this.root, normalized, sequence);
        sequence.addFrame(new Frame(this.toJSON(this.root)));
        if (!this.root.leaf && this.root.n === 0) {
            this.root = this.root.children[0];
            if (this.root) {
                this.root.parent = null;
                this.root.tree = this;
            }
        }
        return sequence;
    }

    /**
     * Delete a value from a node
     * @param {BTreeNode} node
     * @param {number} value
     * @param {Sequence} sequence
     */
    deleteFromNode(node, value, sequence) {
        node.highlighted = [...node.values];
        sequence.addFrame(new Frame(this.toJSON(this.root)));
        // Check if value is in the actual node
        const index = node.values.indexOf(value);
        if (index >= 0) {
            // Value present in the node
            if (node.leaf && node.n > this.order - 1) {
                // If the node is a leaf and has more than order-1 values, just delete it
                node.highlighted = [value];
                sequence.addFrame(new Frame(this.toJSON(this.root)));
                node.removeValue(node.values.indexOf(value));
                return;
            }
            // Check if one children has enough values to transfer
            if (node.children[index].n > this.order - 1 ||
                node.children[index + 1].n > this.order - 1) {
                // One of the immediate children has enough values to transfer
                if (node.children[index].n > this.order - 1) {
                    // Replace the target value for the higher of left node.
                    // Then delete that value from the child
                    const predecessor = this.getMinMaxFromSubTree(node.children[index], 1);
                    node.highlighted = [node.values[index]];
                    sequence.addFrame(new Frame(this.toJSON(this.root)));
                    node.values[index] = predecessor;
                    node.highlighted = [predecessor];
                    sequence.addFrame(new Frame(this.toJSON(this.root)));
                    return this.deleteFromNode(node.children[index], predecessor, sequence);
                }
                const successor = this.getMinMaxFromSubTree(node.children[index + 1], 0);
                node.highlighted = [node.values[index]];
                sequence.addFrame(new Frame(this.toJSON(this.root)));
                node.values[index] = successor;
                node.highlighted = [successor];
                sequence.addFrame(new Frame(this.toJSON(this.root)));
                return this.deleteFromNode(node.children[index + 1], successor, sequence);
            }
            // Children has not enough values to transfer. Do a merge
            this.mergeNodes(node.children[index + 1], node.children[index], sequence);
            return this.deleteFromNode(node.children[index], value, sequence);
        }
        if (node.leaf) {
            // Value is not in the tree
            return;
        }
        // Value is not present in the node, search in the children
        let nextNode = 0;
        while (nextNode < node.n && node.values[nextNode] < value) {
            nextNode += 1;
        }
        if (node.children[nextNode].n > this.order - 1) {
            // Child node has enough values to continue
            return this.deleteFromNode(node.children[nextNode], value, sequence);
        }
        // Child node has not enough values to continue
        // Before visiting next node transfer a value or merge it with a brother
        if ((nextNode > 0 && node.children[nextNode - 1].n > this.order - 1) ||
            (nextNode < node.n && node.children[nextNode + 1].n > this.order - 1)) {
            // One of the immediate children has enough values to transfer
            if (nextNode > 0 && node.children[nextNode - 1].n > this.order - 1) {
                this.transferValue(node.children[nextNode - 1], node.children[nextNode], sequence);
            } else {
                this.transferValue(node.children[nextNode + 1], node.children[nextNode], sequence);
            }
            return this.deleteFromNode(node.children[nextNode], value, sequence);
        }
        // No immediate brother with enough values. Merge nodes
        const target = node.children[nextNode];
        const origin = nextNode > 0 ? node.children[nextNode - 1] : node.children[nextNode + 1];
        this.mergeNodes(origin, target, sequence);
        return this.deleteFromNode(target, value, sequence);
    }

    /**
     * Transfer one value from the origin to the target. O(1)
     * If a sequence is provided, add frames
     * @param {BTreeNode} origin
     * @param {BTreeNode} target
     * @param {Sequence} sequence
    */
    transferValue(origin, target, sequence) {
        const indexo = origin.parent.children.indexOf(origin);
        const indext = origin.parent.children.indexOf(target);
        if (indexo < indext) {
            target.parent.highlighted = [target.parent.values[indexo]];
            origin.highlighted = [origin.values[origin.n - 1]];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
            // Transfer value from parent to target
            target.addValue(target.parent.removeValue(indexo));
            // Transfer value from origin to parent
            origin.parent.addValue(origin.removeValue(origin.n - 1));
            if (!origin.leaf) {
                target.addChild(origin.deleteChild(origin.children.length - 1), 0);
            }
            target.parent.highlighted = [target.parent.values[indexo]];
            target.highlighted = [target.values[0]];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
        } else {
            target.parent.highlighted = [target.parent.values[indext]];
            origin.highlighted = [origin.values[0]];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
            // Transfer value from parent to target
            target.addValue(target.parent.removeValue(indext));
            // Transfer value from origin to parent
            origin.parent.addValue(origin.removeValue(0));
            if (!origin.leaf) {
                target.addChild(origin.deleteChild(0), target.children.length);
            }
            target.parent.highlighted = [target.parent.values[indext]];
            target.highlighted = [target.values[target.n - 1]];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
        }
    }

    /**
     * Merge 2 nodes into one. O(1)
     * If a sequence is provided, add frames
     * @param {BTreeNode} origin
     * @param {BTreeNode} target
     * @param {Sequence} sequence
    */
    mergeNodes(origin, target, sequence) {
        const indexo = origin.parent.children.indexOf(origin);
        const indext = target.parent.children.indexOf(target);
        // Frame with all the nodes involved before merge
        target.parent.highlighted = [target.parent.values[Math.min(indexo, indext)]];
        origin.highlighted = [...origin.values];
        target.highlighted = [...target.values];
        sequence.addFrame(new Frame(this.toJSON(this.root)));
        // Add middle value of the parent into target node
        target.addValue(target.parent.removeValue(Math.min(indexo, indext)));
        // Add every value of origin into target node
        for (let i = origin.n - 1; i >= 0; i -= 1) {
            target.addValue(origin.removeValue(i));
        }
        target.parent.deleteChild(indexo);
        if (!origin.leaf) {
            while (origin.children.length) {
                if (indexo > indext) {
                    target.addChild(origin.deleteChild(0), target.children.length);
                } else {
                    target.addChild(origin.deleteChild(origin.children.length - 1), 0);
                }
            }
        }
        target.highlighted = [...target.values];
        sequence.addFrame(new Frame(this.toJSON(this.root)));
    }

    /**
     * Get the lower or higher value in a sub-tree
     * @param {BTreeNode} node
     * @param { 0 | 1 } max 1 for find max, 0 for min
     * @returns {number}
     */
    getMinMaxFromSubTree(node, max) {
        let current = node;
        while (!current.leaf) {
            current = current.children[max ? current.n : 0];
        }
        current.highlighted = [current.values[max ? current.n - 1 : 0]];
        return current.values[max ? current.n - 1 : 0];
    }

    /**
     * Insert a new value in the tree O(log N)
     * Return Sequence with Frame array to visualize the operation
     * @param {number} value
     * @returns {Sequence}
     */
    insert(value) {
        const sequence = new Sequence();
        const normalized = this.normalizeValue(value);
        if (normalized === null) {
            return sequence;
        }

        if (this.contains(normalized)) {
            const { sequence: highlightSequence } = this.searchValue(normalized);
            return highlightSequence;
        }

        const actual = this.root;
        if (actual.n > 1 || !actual.leaf) {
            // Insert frame with the whole node highlighted
            actual.highlighted = [...actual.values];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
        }
        if (actual.n === 2 * this.order - 1) {
            const temp = new BTreeNode(false);
            temp.tree = this;
            this.root = temp;
            temp.addChild(actual, 0);
            this.split(actual, temp, 1, sequence);
            this.insertNonFull(temp, normalized, sequence);
        } else {
            this.insertNonFull(actual, normalized, sequence);
        }
        // Insert last frame with no highlight
        sequence.addFrame(new Frame(this.toJSON(this.root)));
        return sequence;
    }

    /**
     * Divide child node from parent into parent.values[pos-1] and parent.values[pos]
     * O(1)
     * @param {BTreeNode} child
     * @param {BTreeNode} parent
     * @param {number} pos
     * @param {Sequence} sequence
     */
    split(child, parent, pos, sequence) {
        const newChild = new BTreeNode(child.leaf);
        newChild.tree = this;
        // Create a new child for the parent
        // Trasspass values from the old child to the new
        for (let k = 1; k < this.order; k += 1) {
            newChild.addValue(child.removeValue(this.order));
        }
        // Trasspass child nodes from the old child to the new
        if (!child.leaf) {
            for (let k = 1; k <= this.order; k += 1) {
                newChild.addChild(child.deleteChild(this.order), k - 1);
            }
        }
        // Add new child to the parent
        parent.addChild(newChild, pos);
        // Add traspassed value to parent
        const parentValue = child.removeValue(this.order - 1);
        parent.addValue(parentValue);
        // Highlight the splitted nodes
        child.highlighted = [...child.values];
        newChild.highlighted = [...newChild.values];
        parent.highlighted = [parentValue];
        sequence.addFrame(new Frame(this.toJSON(this.root)));
        parent.leaf = false;
    }

    /**
     * Insert a value in a not-full node. Add frames to the given sequence
     * O(1)
     * @param {BTreeNode} node
     * @param {number} value
     * @param {Sequence} sequence
     */
    insertNonFull(node, value, sequence) {
        let temp = node.n;
        if (node.leaf) {
            node.addValue(value, sequence);
        } else {
            while (temp >= 1 && value < node.values[temp - 1]) {
                // Insert frame for each value compared
                node.highlighted = [node.values[temp - 1]];
                sequence.addFrame(new Frame(this.toJSON(this.root)));
                temp -= 1;
            }
            // Highlight next node
            node.children[temp].highlighted = [...node.children[temp].values];
            sequence.addFrame(new Frame(this.toJSON(this.root)));
            if (node.children[temp].n === 2 * this.order - 1) {
                this.split(node.children[temp], node, temp + 1, sequence);
                if (value > node.values[temp]) {
                    temp += 1;
                    // Highlight next node
                    node.children[temp].highlighted = [...node.children[temp].values];
                    sequence.addFrame(new Frame(this.toJSON(this.root)));
                }
            }
            this.insertNonFull(node.children[temp], value, sequence);
        }
    }

    /**
     * Creates a VisualizerTreeNode
     * @param {BTreeNode} node
     * @param {{ [value: number]: BTreeNode } || Ma} highlight
     * @returns {VisualizerTreeNode}
    */
    toJSON(node) {
        const structure = new VisualizerTreeNode();
        structure.leaves = new VisualizerNodeLeaf();
        for (let i = 0; i < node.n; i += 1) {
            const highlighted = node.highlighted.includes(node.values[i]);
            structure.leaves.addKey(node.values[i], highlighted);
        }
        node.clearHighlights();
        structure.children = node.children.map((child) => this.toJSON(child));
        return structure;
    }
}
