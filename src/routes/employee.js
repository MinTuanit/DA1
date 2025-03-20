const router = require("express").Router();
const employeecontroller = require("../controllers/employeecontroller")

router.post("/", employeecontroller.createEmployee);
router.get("/", employeecontroller.getAllEmployees);
router.get("/:id", employeecontroller.getEmployeeById);
router.delete("/:id", employeecontroller.deleteEmployeeById);
router.patch("/:id", employeecontroller.updateEmployeeById);

module.exports = router;