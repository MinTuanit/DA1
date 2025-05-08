const Employee = require("../models/employee");
const User = require("../models/user");

// const createEmployee = async (req, res) => {
//     try {
//         const { full_name, email, phone, password, cccd, dateOfBirth, position, shift, cinema_id } = req.body;
//         if (await User.isEmailTaken(email)) {
//             console.log("Email đã tồn tại!");
//             return res.status(400).send("Email đã tồn tại. Vui lòng chọn email khác để đăng ký!");
//         }
//         const user = await User.create({
//             full_name,
//             email,
//             phone,
//             password,
//             cccd,
//             dateOfBirth,
//             role: "employee",
//         });
//         const employee = await Employee.create({
//             position,
//             shift,
//             employee_id: user._id,
//             cinema_id,
//         });
//         if (user && employee)
//             res.status(201).send({ user, employee });
//     } catch (error) {
//         console.log("Lỗi server! ", error);
//         return res.status(500).send(error);
//     }
// };

const createEmployee = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            cccd,
            dateOfBirth,
            position,
            shift,
            cinema_id
        } = req.body;

        if (await User.isEmailTaken(email)) {
            console.log("Email đã tồn tại!");
            return res.status(400).send("Email đã tồn tại. Vui lòng chọn email khác để đăng ký!");
        }
        const employee = await Employee.create({
            full_name,
            email,
            phone,
            password,
            cccd,
            dateOfBirth,
            role: "employee",
            position,
            shift,
            cinema_id
        });
        res.status(201).send({ employee });
    } catch (error) {
        console.error("Lỗi server!", error);
        res.status(500).send("Đã xảy ra lỗi khi tạo nhân viên.");
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).send(employees);
    } catch (error) {
        console.error("Lỗi server! ", error);
        res.status(500).send("Lỗi Server");
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
        }
        res.status(200).send(employee);
    } catch (error) {
        console.error("Lỗi server: ", error);
        res.status(500).send("Lỗi Server");
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
        res.status(204).send("Xóa nhân viên thành công");
    } catch (error) {
        console.error("Lỗi server: ", error);
        res.status(500).send("Lỗi Server");
    }
};

const updateEmployeeById = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            cccd,
            dateOfBirth,
            position,
            shift,
            cinema_id
        } = req.body;

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.log("Nhân viên không tồn tại!");
            return res.status(404).send("Không tìm thấy nhân viên có id: " + req.params.id);
        }
        if (full_name !== undefined) employee.full_name = full_name;
        if (email !== undefined) employee.email = email;
        if (phone !== undefined) employee.phone = phone;
        if (password !== undefined) employee.password = password;
        if (cccd !== undefined) employee.cccd = cccd;
        if (dateOfBirth !== undefined) employee.dateOfBirth = dateOfBirth;

        if (position !== undefined) employee.position = position;
        if (shift !== undefined) employee.shift = shift;
        if (cinema_id !== undefined) employee.cinema_id = cinema_id;

        await employee.save();
        res.status(200).send(employee);
    } catch (error) {
        console.error("Lỗi server: ", error);
        res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    deleteEmployeeById,
    updateEmployeeById
};