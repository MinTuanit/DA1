const router = require("express").Router();
const employeecontroller = require("../controllers/employeecontroller");
const auth = require("../middlewares/auth");

router.post("/", auth("manageEmployee"), employeecontroller.createEmployee);
router.get("/", auth("getEmployee"), employeecontroller.getAllEmployees);
router.get("/cinema/:cinemaid", auth("getEmployee"), employeecontroller.getEmployeesByCinemaId);
router.get("/:id", auth("getEmployee"), employeecontroller.getEmployeeById);
router.delete("/:id", auth("manageEmployee"), employeecontroller.deleteEmployeeById);
router.patch("/:id", auth("manageEmployee"), employeecontroller.updateEmployeeById);

module.exports = router;