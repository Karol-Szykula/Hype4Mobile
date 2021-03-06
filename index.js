const OPERATOR = {
  AND: "AND",
  OR: "OR"
};

class Structure {
  /**
   * @constructor
   * @param {string} value - criterion value of a given node
   * @param {boolean} isSplitAble - defines whether given node is splitable
   * @param {string} operator - defines operator for a given level of a structure
   */
  constructor(value, isSplitAble, operator) {
    this.value = value;
    this.isSplitAble = typeof isSplitAble === "boolean" ? isSplitAble : true;
    this.criterions = [];
    this.operator =
      operator === OPERATOR.AND || operator === OPERATOR.OR
        ? operator
        : OPERATOR.AND;
  }
  /**
   *
   * @param {string} path - path to criterion in graph, format - rootCriterion:nestedCriterion1:nestedCriterion2:etc...
   * @param {Structure} criterion - criterion to add in graph -
   */
  addCriterionByPath(path, criterion) {
    const nodeToUpdate = Structure.getNodeByPath(this, path);
    if (nodeToUpdate) {
      nodeToUpdate.addCriterion(criterion);
    }
  }
  /**
   *
   * @param {Structure} criterion - criterion to add in node
   */
  addCriterion(criterion) {
    const isAnySubCriterion = this.criterions.length !== 0;

    if (this.isSplitAble || !isAnySubCriterion) {
      this.criterions.push(criterion);
    } else {
      throw new Error("Not splitable criterion");
    }
  }
  /**
   *
   * @param {string} path - path to criterion in graph, format - rootCriterion:nestedCriterion1:nestedCriterion2:etc...
   */
  toggleLogicOperatorByPath(path) {
    const nodeToUpdate = Structure.getNodeByPath(this, path);

    if (nodeToUpdate.operator === OPERATOR.AND) {
      nodeToUpdate.operator = OPERATOR.OR;
    } else if (nodeToUpdate.operator === OPERATOR.OR) {
      nodeToUpdate.operator = OPERATOR.AND;
    }
  }
  /**
   *
   * @param {string} path - path to criterion in graph, format - rootCriterion:nestedCriterion1:nestedCriterion2:etc...
   */
  removeCriterionByPath(path) {
    const stack = Structure.getNodeStackByPath(this, path);
    const criterionToRemove = Structure.getSearchedCriterion(path);
    const nodeWithCriterionToRemove = stack[stack.length - 2];

    const newCriterions = nodeWithCriterionToRemove.criterions.filter(
      criterion => criterionToRemove !== criterion.value
    );
    nodeWithCriterionToRemove.criterions = newCriterions;
  }
  /**
   *
   * @param {Structure} rootNode
   * @param {string} path - path to criterion in graph, format - rootCriterion:nestedCriterion1:nestedCriterion2:etc...
   */
  static getNodeByPath(rootNode, path) {
    const stack = Structure.getNodeStackByPath(rootNode, path);
    const criterion = Structure.getSearchedCriterion(path);

    const lastNode = stack[stack.length - 1];
    const isLastNodeCorrectNode = lastNode.value === criterion;

    if (isLastNodeCorrectNode) return lastNode;
    throw new Error("No such criterion");
  }
  /**
   *
   * @param {string} path - path to criterion in graph, format - rootCriterion:nestedCriterion1:nestedCriterion2:etc...
   * @returns {string} - name of last criterion in path to search
   */
  static getSearchedCriterion(path) {
    return path.split(":").pop();
  }
  /**
   *
   * @param {Structure} rootNode
   * @param {string} path - path to criterion in graph, format - rootCriterion:nestedCriterion1:nestedCriterion2:etc...
   * @returns {Array} - stack with all criterions in graph from root to searched criterion
   */
  static getNodeStackByPath(rootNode, path) {
    const stack = [];

    const recursiveTraversal = (node, stackArray) => {
      stackArray.push(node);

      const isGivenPathStartingWithResolvedPath = path.startsWith(
        Structure.resolvePath(stackArray)
      );
      const isCorrectPath = path === Structure.resolvePath(stackArray);

      if (!isGivenPathStartingWithResolvedPath) {
        stackArray.pop();
      } else if (isGivenPathStartingWithResolvedPath && !isCorrectPath) {
        node.criterions.forEach(nodeItem => {
          recursiveTraversal(nodeItem, stackArray);
        });
      }
    };

    recursiveTraversal(rootNode, stack);
    return stack;
  }
  /**
   *
   * @param {Array} stack - array with all criterions from root node to searched criterion
   */
  static resolvePath(stack) {
    const path = stack.reduce((path, node, i) => {
      return i === 0 ? `${node.value}` : `${path}:${node.value}`;
    }, "");
    return path;
  }
}

function example() {
  const peopleStructure = new Structure("People");

  const ageCriterion = new Structure("Age", false);

  peopleStructure.addCriterionByPath("People", ageCriterion);

  const ageValue = new Structure("40+", false);

  peopleStructure.addCriterionByPath("People:Age", ageValue);

  const ethinicityCriterion = new Structure("Ethinicity", true, OPERATOR.OR);

  peopleStructure.addCriterionByPath("People", ethinicityCriterion);

  const ethinicityBlack = new Structure("Black", true, OPERATOR.OR);

  peopleStructure.addCriterionByPath("People:Ethinicity", ethinicityBlack);

  const ethinicityHispanic = new Structure("Hispanic", true, OPERATOR.OR);

  peopleStructure.addCriterionByPath("People:Ethinicity", ethinicityHispanic);

  const incomeYearlyCriterion = new Structure("Income yearly", false);

  peopleStructure.addCriterionByPath("People", incomeYearlyCriterion);

  const incomeValue = new Structure("45k USD+", false);

  peopleStructure.addCriterionByPath("People:Income yearly", incomeValue);

  // console.log(peopleStructure.criterions[0].criterions[0]); // 40+ node
  // console.log(peopleStructure.criterions[1].criterions[1]); // hispanic node
  console.log(peopleStructure.criterions[2].criterions[0]); // 45k USD+ node

  /*
  - every criterion is nested as instance of Structure in criterions array
  - for example criterion Ethinicity - Hispanic is nested as peopleStructure.criterions[1].criterions[1]
  - to add a nested criterion, path to it's value needs to be specified, 
    for example to add a Catalans and Mexican to Hispanic criterion, two new instances of Strucutre needs to be created and added with method
    addCriterionByPath('People:Ethinicity:Hispanic, catalansInstance) and
    addCriterionByPath('People:Ethinicity:Hispanic, mexicanInstance)
  - to remove criterion use method removeCriterionByPath with path to a criterion,
    for example to remove criterion Hispanic and it's all nested criterions - removeCriterionByPath('People:Ethinicity:Hispanic'),
  - operator for specified level of criterions is held in a strucutre with an array of criterions of that level
  */
}

example();

module.exports = {
  Structure,
  OPERATOR
};
