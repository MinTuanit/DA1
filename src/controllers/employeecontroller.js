const Employee = require("../models/employee");
const User = require("../models/user");

const createEmployee = async (req, res) => {
    try {
        const { full_name, email, phone, password, cccd, dateOfBirth, position, shift, cinema_id } = req.body;
        if (await User.isEmailTaken(email)) {
            console.log("Email đã tồn tại!");
            return res.status(400).send("Email đã tồn tại. Vui lòng chọn email khác để đăng ký!");
        }
        const user = await User.create({
            full_name,
            email,
            phone,
            password,
            cccd,
            dateOfBirth,
            role: "employee",
        });
        const employee = await Employee.create({
            position,
            shift,
            employee_id: user._id,
            cinema_id,
        });
        if (user && employee)
            res.status(201).send({ user, employee });
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send(error);
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate("employee_id", "full_name email phone");
        res.status(200).send(employees);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).populate("employee_id", "full_name email phone");
        if (!employee) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
        }
        res.status(200).send(employee);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
        }
        await Employee.findByIdAndDelete(req.params.id);
        await User.findByIdAndDelete(employee.employee_id);
        res.status(204).send("Xóa nhân viên thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateEmployeeById = async (req, res) => {
    try {
        const { full_name, email, phone, password, cccd, dateOfBirth, position, shift, cinema_id } = req.body;
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
        }
        if (full_name || email || phone || password || cccd || dateOfBirth) {
            const userUpdates = { full_name, email, phone, password, cccd, dateOfBirth };
            await User.findByIdAndUpdate(employee.employee_id, userUpdates, { new: true });
        }
        const employeeUpdates = { position, shift, cinema_id };
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, employeeUpdates, { new: true });
        res.status(200).send(updatedEmployee);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    deleteEmployeeById,
    updateEmployeeById
};