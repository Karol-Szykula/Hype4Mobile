const Structure = require("./index").Structure;
const OPERATOR = require("./index").OPERATOR;

function setupAgeCriterionStructure() {
  const ageCriterion = new Structure("Age", false);

  const ageCriterionValue = new Structure("40+", false);

  ageCriterion.addCriterion(ageCriterionValue);

  return ageCriterion;
}

function setupEthinicityCriterionStructure() {
  const ethinicityRoot = new Structure("Ethinicity");

  const ethinicityBlack = new Structure("Black");
  const ethinicityHispanic = new Structure("Hispanic");

  ethinicityRoot.addCriterion(ethinicityBlack);
  ethinicityRoot.addCriterion(ethinicityHispanic);

  return ethinicityRoot;
}

function setupStructureWithOneCriterion(structure) {
  const ageCriterion = setupAgeCriterionStructure();

  structure.addCriterion(ageCriterion);
}

function setupStructureWithExisitngSubCriterions(structure) {
  setupStructureWithOneCriterion(structure);

  const ethinicityRoot = setupEthinicityCriterionStructure();

  structure.addCriterion(ethinicityRoot);
}

describe("A query structure", () => {
  let rootStructure;
  beforeEach(() => {
    rootStructure = new Structure("People");
  });
  test("add a criterion to an empty structure", () => {
    const ageCriterion = setupAgeCriterionStructure();
    rootStructure.addCriterionByPath("People", ageCriterion);
    expect(rootStructure.criterions[0].criterions[0].value).toBe("40+");
  });
  test("add a criterion to a non empty structure", () => {
    setupStructureWithOneCriterion(rootStructure);
    const ethinicityCriterion = setupEthinicityCriterionStructure();
    rootStructure.addCriterionByPath("People", ethinicityCriterion);
    expect(rootStructure.criterions[1].criterions[1].value).toBe("Hispanic");
  });
  test("add criterion to a non empty structure and check it's path", () => {
    setupStructureWithOneCriterion(rootStructure);
    const ethinicityCriterion = setupEthinicityCriterionStructure();
    rootStructure.addCriterionByPath("People", ethinicityCriterion);
    const hispanicStack = Structure.getNodeStackByPath(
      rootStructure,
      "People:Ethinicity:Hispanic"
    );
    const hispanicPath = Structure.resolvePath(hispanicStack);
    expect(hispanicPath).toBe("People:Ethinicity:Hispanic");
  });
  test("add a sub-criterion to an existing splitable criterion and check path", () => {
    setupStructureWithExisitngSubCriterions(rootStructure);
    const slavikCriterion = new Structure("Slavik");
    rootStructure.addCriterionByPath("People:Ethinicity", slavikCriterion);

    const slavikStack = Structure.getNodeStackByPath(
      rootStructure,
      "People:Ethinicity:Slavik"
    );

    const slavikPath = Structure.resolvePath(slavikStack);
    expect(slavikPath).toBe("People:Ethinicity:Slavik");
  });
  test("add a sub-criterion to an existing non-splitable criterion", () => {
    setupStructureWithOneCriterion(rootStructure);
    const secondAgeCriterion = new Structure("20-30");
    expect(() => {
      rootStructure.addCriterionByPath("People:Age", secondAgeCriterion);
    }).toThrow("Not splitable criterion");
  });
  test("remove a criterion", () => {
    setupStructureWithExisitngSubCriterions(rootStructure);
    rootStructure.removeCriterionByPath("People:Ethinicity");
    expect(rootStructure.criterions[1]).toBeUndefined();
  });
  test("change a logic operator of a root structure", () => {
    setupStructureWithExisitngSubCriterions(rootStructure);
    rootStructure.toggleLogicOperatorByPath("People");
    expect(rootStructure.operator).toBe(OPERATOR.OR);
  });
  test("change a logic operator of a nested structure", () => {
    setupStructureWithExisitngSubCriterions(rootStructure);
    rootStructure.toggleLogicOperatorByPath("People:Ethinicity");
    expect(rootStructure.criterions[1].operator).toBe(OPERATOR.OR);
  });
  test("get a non existing node by path", () => {
    setupStructureWithExisitngSubCriterions(rootStructure);
    expect(() => {
      Structure.getNodeByPath(rootStructure, "People:Ethinicity:Asian");
    }).toThrow("No such criterion");
  });
});
